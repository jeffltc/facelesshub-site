import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { getPlanLimits } from '@/lib/subscription';
import { getUsage, getTranslatorPoolUsage, incrementTranslatorUsage } from '@/lib/usageTracking';

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

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per IP per 10 minutes
  const rateLimitRes = await checkRateLimit(request, 'rl:translate', 10, '10 m');
  if (rateLimitRes) return rateLimitRes;

  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Translation service not configured' },
      { status: 500 }
    );
  }

  const email = session.user?.email ?? '';
  const { plan, limits } = await getPlanLimits(email);

  try {
    const body: TranslateRequest = await request.json();
    const { items, targetLanguages } = body;

    if (!items?.length || !targetLanguages?.length) {
      return NextResponse.json(
        { error: 'Missing items or targetLanguages' },
        { status: 400 }
      );
    }

    // Validate languages against plan access
    const invalidLangs: string[] = [];
    for (const lang of targetLanguages) {
      const isPremiumLang = !FREE_LANGUAGES.includes(lang as (typeof FREE_LANGUAGES)[number]);
      if (isPremiumLang && plan === 'free') {
        invalidLangs.push(lang);
      }
    }
    if (invalidLangs.length > 0) {
      return NextResponse.json(
        {
          error: `Your free plan only supports EN/ZH/JA/ES. Upgrade for: ${invalidLangs.join(', ')}.`,
          code: 'PLAN_LIMIT_EXCEEDED',
          plan,
        },
        { status: 403 }
      );
    }

    // Check max languages
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

    // Quota check: per-video (not per video×language)
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Translate per language sequentially
    const translationsByLang: Record<
      string,
      Array<{ videoId: string; translatedTitle: string; translatedDescription: string }>
    > = {};

    for (const lang of targetLanguages) {
      const targetLangName = LANGUAGE_NAMES[lang] ?? lang;
      const results: Array<{ videoId: string; translatedTitle: string; translatedDescription: string }> = [];

      // Batch in groups of 10
      for (let i = 0; i < items.length; i += 10) {
        const batch = items.slice(i, i + 10);

        const prompt = `You are a professional YouTube content translator. Translate the following YouTube video titles and descriptions into ${targetLangName}.

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

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          results.push(...parsed);
        }
      }

      translationsByLang[lang] = results;
    }

    // Increment usage after successful translation
    const usageResult = await incrementTranslatorUsage(
      email,
      videosCount,
      limits.translatorDailyVideos,
      limits.translatorMonthlyPool
    );

    const newDailyRemaining = Math.max(0, limits.translatorDailyVideos - usageResult.dailyUsed);
    const newPoolRemaining = Math.max(0, limits.translatorMonthlyPool - usageResult.poolUsed);

    return NextResponse.json({
      translations: translationsByLang,
      quotaUsed: videosCount,
      dailyRemaining: newDailyRemaining,
      poolRemaining: newPoolRemaining,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Translation failed';
    console.error('Translation error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
