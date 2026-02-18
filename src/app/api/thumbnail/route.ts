import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_QUALITIES = new Set([
  'maxresdefault',
  'sddefault',
  'hqdefault',
  'mqdefault',
  'default',
]);

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{1,11}$/;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const quality = searchParams.get('quality');

  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }

  if (!quality || !ALLOWED_QUALITIES.has(quality)) {
    return NextResponse.json({ error: 'Invalid quality' }, { status: 400 });
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;

  try {
    const response = await fetch(thumbnailUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Thumbnail not found' },
        { status: 404 }
      );
    }

    const imageBytes = await response.arrayBuffer();

    return new NextResponse(imageBytes, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="thumbnail-${videoId}-${quality}.jpg"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch thumbnail' },
      { status: 500 }
    );
  }
}
