import { getSupabase } from '@/lib/supabase';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

function getYouTube() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error('Missing YOUTUBE_API_KEY');
  return google.youtube({ version: 'v3', auth: key });
}

function getTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

interface CompetitorConfig {
  id: string;
  channel_id: string;
  channel_title: string;
  owner_email: string;
  notify_email: string;
  ratio_min: number;
  label: string | null;
}

interface VideoMeta {
  video_id: string;
  channel_id: string;
  title: string;
  thumbnail_url: string;
  view_count: number;
  sub_count: number;
  ratio: number;
  duration_s: number;
  published_at: string;
}

function parseDuration(iso: string): number {
  // PT1M30S → 90
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (Number(m[1] ?? 0) * 3600) + (Number(m[2] ?? 0) * 60) + Number(m[3] ?? 0);
}

async function fetchChannelVideos(
  youtube: ReturnType<typeof getYouTube>,
  channelId: string
): Promise<VideoMeta[]> {
  // Step 1: Get channel subscriber count
  const chRes = await youtube.channels.list({
    part: ['statistics'],
    id: [channelId],
    maxResults: 1,
  });
  const subCount = Number(chRes.data.items?.[0]?.statistics?.subscriberCount ?? 0);

  // Step 2: Search recent videos from this channel
  const searchRes = await youtube.search.list({
    part: ['id'],
    channelId,
    order: 'date',
    maxResults: 50,
    type: ['video'],
    publishedAfter: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const videoIds = (searchRes.data.items ?? [])
    .map((item) => item.id?.videoId)
    .filter(Boolean) as string[];

  if (videoIds.length === 0) return [];

  // Step 3: Get video details (statistics + contentDetails)
  const vidRes = await youtube.videos.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    id: videoIds,
    maxResults: 50,
  });

  const videos: VideoMeta[] = [];
  for (const v of vidRes.data.items ?? []) {
    const viewCount = Number(v.statistics?.viewCount ?? 0);
    const durationS = parseDuration(v.contentDetails?.duration ?? '');
    // Only Shorts (≤ 60s)
    if (durationS > 60) continue;
    const ratio = subCount > 0 ? viewCount / subCount : viewCount;
    videos.push({
      video_id:      v.id ?? '',
      channel_id:    channelId,
      title:         v.snippet?.title ?? '',
      thumbnail_url: v.snippet?.thumbnails?.medium?.url ?? v.snippet?.thumbnails?.default?.url ?? '',
      view_count:    viewCount,
      sub_count:     subCount,
      ratio:         Math.round(ratio * 10) / 10,
      duration_s:    durationS,
      published_at:  v.snippet?.publishedAt ?? new Date().toISOString(),
    });
  }

  return videos;
}

async function sendEmail(
  to: string,
  channelTitle: string,
  label: string | null,
  videos: VideoMeta[]
) {
  const transport = getTransport();
  const displayName = label || channelTitle;

  const rows = videos
    .map(
      (v) => `
      <tr>
        <td style="padding:8px">
          <img src="${v.thumbnail_url}" width="120" style="border-radius:4px" alt="${v.title}">
        </td>
        <td style="padding:8px;vertical-align:top">
          <a href="https://www.youtube.com/shorts/${v.video_id}" style="color:#6366f1;font-weight:600;text-decoration:none">
            ${v.title}
          </a>
          <br>
          <span style="color:#94a3b8;font-size:12px">
            ${v.view_count.toLocaleString()} views · ${v.sub_count.toLocaleString()} subs · ${v.ratio}× ratio · ${v.duration_s}s
          </span>
        </td>
      </tr>`
    )
    .join('');

  await transport.sendMail({
    from: `FacelessHub <${process.env.GMAIL_USER}>`,
    to,
    subject: `[Competitor Alert] ${displayName}: ${videos.length} new viral Short${videos.length !== 1 ? 's' : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#6366f1">Competitor Alert: ${displayName}</h2>
        <p style="color:#64748b">${videos.length} new Short${videos.length !== 1 ? 's' : ''} meeting your criteria</p>
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        <hr style="border-color:#1e293b;margin:24px 0">
        <p style="color:#64748b;font-size:12px">
          Manage your monitors at <a href="https://facelesschannel.net/tools/competitor-monitor" style="color:#6366f1">FacelessHub</a>
        </p>
      </div>`,
  });
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('Authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const youtube = getYouTube();

  const { data: configs, error: cfgErr } = await supabase
    .from('competitor_configs')
    .select('id, channel_id, channel_title, owner_email, notify_email, ratio_min, label')
    .eq('active', true);

  if (cfgErr) return Response.json({ error: cfgErr.message }, { status: 500 });
  if (!configs || configs.length === 0) return Response.json({ processed: 0 });

  let totalSent = 0;
  const errors: string[] = [];

  for (const config of configs as CompetitorConfig[]) {
    try {
      const videos = await fetchChannelVideos(youtube, config.channel_id);
      const qualifying = videos.filter((v) => v.ratio >= config.ratio_min);

      if (qualifying.length === 0) continue;

      // Check which videos already sent
      const videoIds = qualifying.map((v) => v.video_id);
      const { data: alreadySent } = await supabase
        .from('competitor_sent')
        .select('video_id')
        .eq('config_id', config.id)
        .in('video_id', videoIds);

      const sentSet = new Set((alreadySent ?? []).map((s: { video_id: string }) => s.video_id));
      const newVideos = qualifying.filter((v) => !sentSet.has(v.video_id));

      if (newVideos.length === 0) continue;

      // Upsert video metadata
      await supabase
        .from('competitor_videos')
        .upsert(newVideos, { onConflict: 'channel_id,video_id' });

      // Insert sent records
      await supabase.from('competitor_sent').insert(
        newVideos.map((v) => ({ config_id: config.id, video_id: v.video_id }))
      );

      // Send email
      await sendEmail(config.notify_email, config.channel_title, config.label, newVideos);
      totalSent += newVideos.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`config ${config.id}: ${msg}`);
      console.error(`Competitor scan error for config ${config.id}:`, msg);
    }
  }

  return Response.json({ processed: configs.length, totalSent, errors });
}
