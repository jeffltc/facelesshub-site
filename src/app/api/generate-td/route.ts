import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { checkRateLimit, getIP } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';

const SYSTEM_PROMPT = `You are a YouTube SEO expert who specializes in crafting high-performing video titles and descriptions.

Rules for Title:
- Maximum 100 characters
- Include the primary keyword naturally
- Use power words that drive clicks (e.g., "Best", "Ultimate", "How to", numbers)
- Create curiosity or promise value
- Avoid clickbait that doesn't deliver
- Use Title Case for English, natural casing for other languages

Rules for Description:
- First 150 characters are critical (shown in search results) — front-load keywords
- Include primary and secondary keywords naturally
- 500-2000 characters total
- Structure: Hook paragraph → Key points → Call to action → Hashtags
- Include 3-5 relevant hashtags at the end
- Use line breaks for readability
- Do NOT include placeholder links — use [YOUR LINK] if appropriate

Respond ONLY with valid JSON in this exact format:
{"title": "...", "description": "..."}`;

const MAX_REQUIREMENT_LENGTH = 2000;
const MAX_REFERENCE_LENGTH = 5000;

interface GenerateRequest {
  referenceTDs?: string;
  requirement: string;
  image?: string; // base64 data URL
  turnstileToken?: string;
}

export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per IP per hour
  const rateLimitRes = await checkRateLimit(request, 'rl:generate-td', 20, '1 h');
  if (rateLimitRes) return rateLimitRes;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Service not configured' },
      { status: 500 }
    );
  }

  try {
    const body: GenerateRequest = await request.json();
    const { referenceTDs, requirement, image, turnstileToken } = body;

    // Turnstile verification
    const ip = getIP(request);
    const turnstileOk = await verifyTurnstile(turnstileToken ?? null, ip);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: 'Human verification failed. Please try again.' },
        { status: 403 }
      );
    }

    if (!requirement?.trim()) {
      return NextResponse.json(
        { error: 'Requirement is required' },
        { status: 400 }
      );
    }

    // Input length limits
    if (requirement.length > MAX_REQUIREMENT_LENGTH) {
      return NextResponse.json(
        { error: `Requirement must be under ${MAX_REQUIREMENT_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (referenceTDs && referenceTDs.length > MAX_REFERENCE_LENGTH) {
      return NextResponse.json(
        { error: `Reference text must be under ${MAX_REFERENCE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Validate image size if provided
    if (image) {
      const base64Data = image.split(',')[1] ?? image;
      const sizeInBytes = Math.ceil(base64Data.length * 0.75);
      if (sizeInBytes > 1024 * 1024) {
        return NextResponse.json(
          { error: 'Image must be under 1MB' },
          { status: 400 }
        );
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    let userPrompt = `Generate a YouTube title and description based on the following:\n\n`;
    userPrompt += `**User Requirement:** ${requirement}\n\n`;

    if (referenceTDs?.trim()) {
      userPrompt += `**Reference Titles & Descriptions (use as style/structure reference):**\n${referenceTDs}\n\n`;
    }

    if (image) {
      userPrompt += `**An image is also provided.** Use the visual content of this image (likely a thumbnail or screenshot) as additional context when generating the title and description. Describe what you see and incorporate relevant details.\n\n`;
    }

    userPrompt += `Generate one optimized YouTube title and description. Respond with JSON only.`;

    const parts: Part[] = [{ text: userPrompt }];

    if (image) {
      const match = image.match(/^data:(.+?);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to parse generation result' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      title: parsed.title ?? '',
      description: parsed.description ?? '',
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Generation failed';
    console.error('TD Generation error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
