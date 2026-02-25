import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getPlanLimits } from '@/lib/subscription';
import { getUsage, getTranslatorPoolUsage, incrementTranslatorUsage } from '@/lib/usageTracking';

// Allow up to 60s for long translation runs
export const maxDuration = 60;

export const FREE_LANGUAGES = ['en', 'zh', 'ja', 'es'] as const;

export const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  es: 'Spanish',
  ko: 'Korean',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ar: 'Arabic',
  hi: 'Hindi',
  ru: 'Russian',
  it: 'Italian',
  th: 'Thai',
  vi: 'Vietnamese',
  id: 'Indonesian',
  tr: 'Turkish',
  nl: 'Dutch',
  pl: 'Polish',
  sv: 'Swedish',
  da: 'Danish',
};

interface TranslateRequest {
  items: Array<{
    videoId: string;
    title: string;
    description: string;
  }>;
  targetLanguages: string[];
}

/** Call Gemini with exponential-backoff retry on 429 */
async function callGeminiWithRetry(
  model: GenerativeModel,
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = msg.includes('429') || msg.toLowerCase().includes('too many requests');
      if (is429 && attempt < maxRetries) {
        // Exponential backoff: 3 s → 6 s → 12 s
        const delayMs = Math.pow(2, attempt + 1) * 1500;
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

function buildPrompt(
  targetLangName: string,
  batch: Array<{ videoId: string; title: string; description: string }>
): string {
  return `You are a professional YouTube content translator. Translate the following YouTube video titles and descriptions into ${targetLangName}.

Rules:
- Keep the translation natural and engaging for ${targetLangName}-speaking YouTube audience
- Maintain SEO keywords where possible
- Keep the tone and style of the original
- Do NOT translate brand names, product names, or proper nouns
- For titles: keep them concise and click-worthy (under 100 characters)
- For descriptions: preserve paragraph structure, links, and formatting

Respond in valid JSON format only, as an array of objects with keys: videoId, translatedTitle, translatedDescription

Videos to translate:
${JSON.stringify(
    batch.map((item) => ({
      videoId: item.videoId,
      title: item.title,
      description: item.description,
    })),
    null,
    2
  )}`;
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per IP per 10 minutes
  const rateLimitRes = await checkRateLimit(request, 'rl:translate', 10, '10 m');
  if (rateLimitRes) return rateLimitRes;

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Translation service not configured' },
      { status: 500 }
    );
  }

  const email = session.user.email;
  const { plan, limits } = await getPlanLimits(email);

  let body: TranslateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { items, targetLanguages } = body;

  if (!items?.length || !targetLanguages?.length) {
    return NextResponse.json(
      { error: 'Missing items or targetLanguages' },
      { status: 400 }
    );
  }

  // Validate language plan access
  for (const lang of targetLanguages) {
    const isPremiumLang = !FREE_LANGUAGES.includes(lang as (typeof FREE_LANGUAGES)[number]);
    if (isPremiumLang && plan === 'free') {
      return NextResponse.json(
        {
          error: `Your free plan only supports EN/ZH/JA/ES. Upgrade for: ${lang}.`,
          code: 'PLAN_LIMIT_EXCEEDED',
          plan,
        },
        { status: 403 }
      );
    }
  }

  if (targetLanguages.length > limits.translatorMaxLanguages) {
    return NextResponse.json(
      {
        error: `Your ${plan} plan allows up to ${limits.translatorMaxLanguages} languages.`,
        code: 'PLAN_LIMIT_EXCEEDED',
        plan,
      },
      { status: 403 }
    );
  }

  // Quota check
  const videosCount = items.length;
  const [dailyUsed, poolUsed] = await Promise.all([
    getUsage(email, 'translator'),
    getTranslatorPoolUsage(email),
  ]);

  const dailyRemaining = Math.max(0, limits.translatorDailyVideos - dailyUsed);
  const poolRemaining = Math.max(0, limits.translatorMonthlyPool - poolUsed);

  if (dailyRemaining + poolRemaining < videosCount) {
    return NextResponse.json(
      {
        error: 'Daily and monthly quota exceeded.',
        code: 'QUOTA_EXCEEDED',
        dailyUsed,
        dailyLimit: limits.translatorDailyVideos,
        dailyRemaining,
        poolUsed,
        poolLimit: limits.translatorMonthlyPool,
        poolRemaining,
        plan,
      },
      { status: 429 }
    );
  }

  // All checks passed — stream SSE response
  const encoder = new TextEncoder();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const translationsByLang: Record<
          string,
          Array<{ videoId: string; translatedTitle: string; translatedDescription: string }>
        > = {};

        for (let i = 0; i < targetLanguages.length; i++) {
          const lang = targetLanguages[i];
          const targetLangName = LANGUAGE_NAMES[lang] ?? lang;

          // Notify frontend which language is being processed
          send({ type: 'progress', language: lang, langName: targetLangName, index: i + 1, total: targetLanguages.length });

          const results: Array<{ videoId: string; translatedTitle: string; translatedDescription: string }> = [];

          // Process in batches of 10
          for (let b = 0; b < items.length; b += 10) {
            const batch = items.slice(b, b + 10);
            const prompt = buildPrompt(targetLangName, batch);

            const text = await callGeminiWithRetry(model, prompt);
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              results.push(...parsed);
            }
          }

          translationsByLang[lang] = results;
          send({ type: 'result', language: lang, translations: results });

          // Small pause between languages to stay within rate limits
          if (i < targetLanguages.length - 1) {
            await new Promise((r) => setTimeout(r, 400));
          }
        }

        // Charge quota after all languages completed successfully
        const usageResult = await incrementTranslatorUsage(
          email,
          videosCount,
          limits.translatorDailyVideos,
          limits.translatorMonthlyPool
        );

        send({
          type: 'done',
          translations: translationsByLang,
          dailyRemaining: Math.max(0, limits.translatorDailyVideos - usageResult.dailyUsed),
          poolRemaining: Math.max(0, limits.translatorMonthlyPool - usageResult.poolUsed),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const is429 = msg.includes('429') || msg.toLowerCase().includes('too many requests');
        send({
          type: 'error',
          message: is429
            ? 'Translation service is busy. Please try again in a moment.'
            : 'Translation failed. Please try again.',
          code: is429 ? 'RATE_LIMITED' : 'TRANSLATION_ERROR',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// GET endpoint to return supported languages
export async function GET() {
  return NextResponse.json({
    free: FREE_LANGUAGES.map((code) => ({
      code,
      name: LANGUAGE_NAMES[code],
    })),
    premium: Object.entries(LANGUAGE_NAMES)
      .filter(([code]) => !FREE_LANGUAGES.includes(code as (typeof FREE_LANGUAGES)[number]))
      .map(([code, name]) => ({ code, name })),
  });
}
