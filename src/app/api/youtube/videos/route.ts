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

    // Get the user's channel
    const channelRes = await youtube.channels.list({
      part: ['contentDetails'],
      mine: true,
    });

    const uploadsPlaylistId =
      channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return NextResponse.json({ videos: [] });
    }

    // Get videos from uploads playlist
    const allVideos: Array<{
      id: string;
      title: string;
      description: string;
      thumbnail: string;
      publishedAt: string;
      defaultLanguage?: string;
      localizations?: Record<string, { title: string; description: string }>;
    }> = [];

    let nextPageToken: string | undefined;

    // Fetch up to 150 videos (3 pages)
    for (let page = 0; page < 3; page++) {
      const playlistRes = await youtube.playlistItems.list({
        part: ['snippet'],
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const videoIds =
        playlistRes.data.items
          ?.map((item) => item.snippet?.resourceId?.videoId)
          .filter(Boolean) as string[];

      if (videoIds.length > 0) {
        // Get full video details including localizations
        const videoRes = await youtube.videos.list({
          part: ['snippet', 'localizations'],
          id: videoIds,
        });

        for (const video of videoRes.data.items ?? []) {
          allVideos.push({
            id: video.id!,
            title: video.snippet?.title ?? '',
            description: video.snippet?.description ?? '',
            thumbnail:
              video.snippet?.thumbnails?.medium?.url ??
              video.snippet?.thumbnails?.default?.url ??
              '',
            publishedAt: video.snippet?.publishedAt ?? '',
            defaultLanguage: video.snippet?.defaultLanguage ?? undefined,
            localizations: video.localizations as Record<
              string,
              { title: string; description: string }
            >,
          });
        }
      }

      nextPageToken = playlistRes.data.nextPageToken ?? undefined;
      if (!nextPageToken) break;
    }

    return NextResponse.json({ videos: allVideos });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch videos';
    console.error('YouTube API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
