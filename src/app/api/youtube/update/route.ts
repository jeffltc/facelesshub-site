import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/auth';
import { getValidChannelToken } from '@/lib/youtube-token';

interface UpdateRequest {
  channelId: string;
  updates: Array<{
    videoId: string;
    language: string;
    title: string;
    description: string;
  }>;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.user.email;

  try {
    const body: UpdateRequest = await request.json();
    const { channelId, updates } = body;

    if (!channelId) {
      return NextResponse.json({ error: 'channelId is required' }, { status: 400 });
    }

    if (!updates?.length) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    let accessToken: string;
    try {
      accessToken = await getValidChannelToken(email, channelId);
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'CHANNEL_NOT_CONNECTED') {
        return NextResponse.json({ error: 'Channel not connected', code: 'CHANNEL_NOT_CONNECTED' }, { status: 404 });
      }
      if (name === 'CHANNEL_REFRESH_FAILED' || name === 'CHANNEL_TOKEN_EXPIRED_NO_REFRESH') {
        return NextResponse.json({ error: 'Channel access expired. Please reconnect.', code: 'CHANNEL_TOKEN_EXPIRED' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Failed to get channel token' }, { status: 500 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const results: Array<{
      videoId: string;
      success: boolean;
      error?: string;
    }> = [];

    // Group updates by videoId (one video may have multiple language updates)
    const groupedByVideo = new Map<
      string,
      Array<{ language: string; title: string; description: string }>
    >();

    for (const update of updates) {
      const existing = groupedByVideo.get(update.videoId) ?? [];
      existing.push({
        language: update.language,
        title: update.title,
        description: update.description,
      });
      groupedByVideo.set(update.videoId, existing);
    }

    for (const [videoId, langs] of groupedByVideo) {
      try {
        // First get the current video data
        const videoRes = await youtube.videos.list({
          part: ['snippet', 'localizations'],
          id: [videoId],
        });

        const video = videoRes.data.items?.[0];
        if (!video || !video.snippet) {
          results.push({
            videoId,
            success: false,
            error: 'Video not found',
          });
          continue;
        }

        // Merge new localizations with existing ones
        const existingLocalizations = (video.localizations ?? {}) as Record<
          string,
          { title: string; description: string }
        >;

        for (const lang of langs) {
          existingLocalizations[lang.language] = {
            title: lang.title,
            description: lang.description,
          };
        }

        // YouTube API requires snippet.defaultLanguage to be set before localizations
        // can be updated. Always send snippet + localizations together in one request.
        // Fallback chain: defaultLanguage → defaultAudioLanguage → 'en'
        const defaultLanguage =
          video.snippet.defaultLanguage ||
          video.snippet.defaultAudioLanguage ||
          'en';

        await youtube.videos.update({
          part: ['snippet', 'localizations'],
          requestBody: {
            id: videoId,
            snippet: {
              title: video.snippet.title!,
              description: video.snippet.description ?? '',
              categoryId: video.snippet.categoryId!,
              defaultLanguage,
            },
            localizations: existingLocalizations,
          },
        });

        results.push({ videoId, success: true });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Update failed';
        console.error(`YouTube update failed for ${videoId}:`, error);
        results.push({ videoId, success: false, error: message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Update failed';
    console.error('YouTube update error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
