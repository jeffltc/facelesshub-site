import { auth } from '@/lib/auth';
import { google } from 'googleapis';

function getYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('Missing YOUTUBE_API_KEY');
  return google.youtube({ version: 'v3', auth: key });
}

/**
 * Parse various channel URL forms into { type, value }
 * Supported forms:
 *   @handle              → { type: 'handle', value: 'handle' }
 *   youtube.com/@handle  → { type: 'handle', value: 'handle' }
 *   youtube.com/channel/UCxxx → { type: 'id', value: 'UCxxx' }
 *   UCxxx (bare ID)      → { type: 'id', value: 'UCxxx' }
 */
function parseChannelInput(input: string): { type: 'handle' | 'id'; value: string } | null {
  const s = input.trim();

  // Bare UC... channel ID
  if (/^UC[\w-]{20,}$/.test(s)) {
    return { type: 'id', value: s };
  }

  // @handle (bare)
  if (s.startsWith('@')) {
    return { type: 'handle', value: s.slice(1) };
  }

  try {
    const url = new URL(s.startsWith('http') ? s : `https://${s}`);
    const path = url.pathname;

    // /channel/UCxxx
    const channelMatch = path.match(/^\/channel\/(UC[\w-]{20,})/);
    if (channelMatch) return { type: 'id', value: channelMatch[1] };

    // /@handle
    const handleMatch = path.match(/^\/@([\w.-]+)/);
    if (handleMatch) return { type: 'handle', value: handleMatch[1] };

    // /c/customname or /user/username — treat as handle for best effort
    const customMatch = path.match(/^\/(?:c|user)\/([\w.-]+)/);
    if (customMatch) return { type: 'handle', value: customMatch[1] };
  } catch {
    // not a URL
  }

  return null;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const input = url.searchParams.get('url');
  if (!input?.trim()) {
    return Response.json({ error: 'url parameter is required' }, { status: 400 });
  }

  const parsed = parseChannelInput(input);
  if (!parsed) {
    return Response.json({ error: 'Could not parse channel URL or handle' }, { status: 400 });
  }

  try {
    const youtube = getYouTube();
    const params =
      parsed.type === 'id'
        ? { id: [parsed.value] }
        : { forHandle: parsed.value };

    const res = await youtube.channels.list({
      part: ['snippet', 'statistics'],
      maxResults: 1,
      ...params,
    });

    const ch = res.data.items?.[0];
    if (!ch) {
      return Response.json({ error: 'Channel not found' }, { status: 404 });
    }

    return Response.json({
      channelId: ch.id ?? '',
      channelTitle: ch.snippet?.title ?? '',
      subscriberCount: Number(ch.statistics?.subscriberCount ?? 0),
      thumbnailUrl:
        ch.snippet?.thumbnails?.medium?.url ??
        ch.snippet?.thumbnails?.default?.url ??
        '',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'YouTube API error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
