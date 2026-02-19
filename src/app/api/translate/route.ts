import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

const FREE_LANGUAGES = ['en', 'zh', 'ja', 'es'] as const;

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  zh: 'Chinese (Simplified)',
  ja: 'Japanese',
  es: 'Spanish',
  // Premium languages (reserved for future)
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
  targetLanguage: string;
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

  try {
    const body: TranslateRequest = await request.json();
    const { items, targetLanguage } = body;

    if (!items?.length || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing items or targetLanguage' },
        { status: 400 }
      );
    }

    // Check if language is in free tier
    if (!FREE_LANGUAGES.includes(targetLanguage as (typeof FREE_LANGUAGES)[number])) {
      return NextResponse.json(
        { error: 'This language requires a premium plan', code: 'PREMIUM_REQUIRED' },
        { status: 403 }
      );
    }

    if (items.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 videos per batch' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const targetLangName = LANGUAGE_NAMES[targetLanguage] ?? targetLanguage;

    // Translate in batches of 10
    const results: Array<{
      videoId: string;
      translatedTitle: string;
      translatedDescription: string;
    }> = [];

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

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        results.push(...parsed);
      }
    }

    return NextResponse.json({ translations: results });
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
