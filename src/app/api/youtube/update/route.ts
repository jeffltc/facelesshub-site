import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/lib/auth';

interface UpdateRequest {
  updates: Array<{
    videoId: string;
    language: string;
    title: string;
    description: string;
  }>;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body: UpdateRequest = await request.json();
    const { updates } = body;

    if (!updates?.length) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });

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

        // YouTube API requires defaultLanguage to be set before adding localizations.
        // If not set, default to 'en' (the most common case for YouTube videos).
        const needsDefaultLang = !video.snippet.defaultLanguage;

        if (needsDefaultLang) {
          video.snippet.defaultLanguage = 'en';
          await youtube.videos.update({
            part: ['snippet'],
            requestBody: {
              id: videoId,
              snippet: {
                title: video.snippet.title!,
                description: video.snippet.description ?? '',
                categoryId: video.snippet.categoryId!,
                defaultLanguage: 'en',
              },
            },
          });
        }

        // Update the video with new localizations
        await youtube.videos.update({
          part: ['localizations'],
          requestBody: {
            id: videoId,
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
