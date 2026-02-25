import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const channelRes = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      mine: true,
      maxResults: 50,
    });

    const channels = (channelRes.data.items ?? []).map((ch) => ({
      id: ch.id ?? '',
      title: ch.snippet?.title ?? '',
      thumbnail:
        ch.snippet?.thumbnails?.default?.url ??
        ch.snippet?.thumbnails?.medium?.url ??
        '',
      subscriberCount: ch.statistics?.subscriberCount ?? '0',
      videoCount: ch.statistics?.videoCount ?? '0',
    }));

    return NextResponse.json({ channels });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch channels';
    console.error('YouTube channels API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
