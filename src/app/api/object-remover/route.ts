import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { checkRateLimit, getIP } from '@/lib/rateLimit';
import { verifyTurnstile } from '@/lib/turnstile';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MODEL = 'zylim0702/remove-object:0e3a841c913f597c1e4c321560aa69e2bc1f15c65f8c366caafc379240efd8ba';

export async function POST(request: NextRequest) {
  // Rate limit: 5 requests per IP per hour
  const rateLimitRes = await checkRateLimit(request, 'rl:object-remover', 5, '1 h');
  if (rateLimitRes) return rateLimitRes;

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'API token not configured' },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  // Turnstile verification
  const turnstileToken = formData.get('cf-turnstile-response') as string | null;
  const ip = getIP(request);
  const turnstileOk = await verifyTurnstile(turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      { error: 'Human verification failed. Please try again.' },
      { status: 403 }
    );
  }

  const imageFile = formData.get('image') as File | null;
  const maskFile = formData.get('mask') as File | null;

  if (!imageFile || !maskFile) {
    return NextResponse.json(
      { error: 'Both image and mask files are required' },
      { status: 400 }
    );
  }

  if (imageFile.size > MAX_SIZE || maskFile.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'File size must be under 10MB' },
      { status: 400 }
    );
  }

  const replicate = new Replicate({ auth: token });

  try {
    const output = await replicate.run(MODEL, {
      input: {
        image: imageFile,
        mask: maskFile,
      },
    });

    const resultUrl = (output as { url: () => URL }).url().toString();
    const imgRes = await fetch(resultUrl);
    if (!imgRes.ok) {
      throw new Error(`Failed to fetch result: ${imgRes.status}`);
    }

    const imgBytes = await imgRes.arrayBuffer();

    return new NextResponse(imgBytes, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="removed.png"',
      },
    });
  } catch (err) {
    console.error('Replicate error:', err);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
