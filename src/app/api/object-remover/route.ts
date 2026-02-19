import { NextRequest, NextResponse } from 'next/server';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const apiKey = process.env.CLIPDROP_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 }
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

  const form = new FormData();
  form.append('image_file', imageFile);
  form.append('mask_file', maskFile);
  form.append('mode', 'quality');

  try {
    const res = await fetch('https://clipdrop-api.co/cleanup/v1', {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Clipdrop error:', res.status, text);
      return NextResponse.json(
        { error: `Clipdrop API error: ${res.status}` },
        { status: res.status >= 400 && res.status < 500 ? 400 : 500 }
      );
    }

    const resultBytes = await res.arrayBuffer();

    return new NextResponse(resultBytes, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="removed.png"',
      },
    });
  } catch (err) {
    console.error('Object remover error:', err);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
}
