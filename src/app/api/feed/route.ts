import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getPlanLimits } from '@/lib/subscription';

export interface FeedItem {
  source_type: 'keyword' | 'competitor';
  source_label: string;
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  view_count: number;
  sub_count: number;
  ratio: number;
  duration_s: number;
  published_at: string;
  sent_at: string;
}

type SentRow = { config_id: string; video_id: string; sent_at: string };
type VideoRow = Record<string, unknown>;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const email = session.user.email;

  const supabase = getSupabase();
  const { plan, limits } = await getPlanLimits(email);

  // ── Keyword feed ────────────────────────────────────────────────
  async function buildKeywordFeed(): Promise<FeedItem[]> {
    const { data: configs } = await supabase
      .from('monitor_configs')
      .select('id, keyword, label')
      .eq('owner_email', email);

    if (!configs || configs.length === 0) return [];

    const configIds = configs.map((c: { id: string }) => c.id);
    const configMap = Object.fromEntries(
      configs.map((c: { id: string; keyword: string; label: string | null }) => [c.id, c])
    );

    const { data: sent } = await supabase
      .from('monitor_sent')
      .select('config_id, video_id, sent_at')
      .in('config_id', configIds)
      .order('sent_at', { ascending: false })
      .limit(200);

    if (!sent || sent.length === 0) return [];

    const videoIds = [...new Set((sent as SentRow[]).map((s) => s.video_id))];
    const { data: videos } = await supabase
      .from('keyword_videos')
      .select('*')
      .in('video_id', videoIds);

    const videoMap = new Map<string, VideoRow>();
    (videos || []).forEach((v: VideoRow) =>
      videoMap.set(`${v.keyword}:${v.video_id}`, v)
    );

    const result: FeedItem[] = [];
    for (const s of sent as SentRow[]) {
      const cfg = configMap[s.config_id];
      if (!cfg) continue;
      const v = videoMap.get(`${cfg.keyword}:${s.video_id}`);
      if (!v) continue;
      result.push({
        source_type:   'keyword',
        source_label:  cfg.label || cfg.keyword,
        video_id:      String(v.video_id ?? ''),
        title:         String(v.title ?? ''),
        channel_title: String(v.channel_title ?? ''),
        thumbnail_url: String(v.thumbnail_url ?? ''),
        view_count:    Number(v.view_count ?? 0),
        sub_count:     Number(v.sub_count ?? 0),
        ratio:         Number(v.ratio ?? 0),
        duration_s:    Number(v.duration_s ?? 0),
        published_at:  String(v.published_at ?? ''),
        sent_at:       s.sent_at,
      });
    }
    return result;
  }

  // ── Competitor feed ─────────────────────────────────────────────
  async function buildCompetitorFeed(): Promise<FeedItem[]> {

    const { data: configs } = await supabase
      .from('competitor_configs')
      .select('id, channel_id, channel_title, label')
      .eq('owner_email', email);

    if (!configs || configs.length === 0) return [];

    const configIds = configs.map((c: { id: string }) => c.id);
    const configMap = Object.fromEntries(
      configs.map((c: { id: string; channel_id: string; channel_title: string; label: string | null }) => [c.id, c])
    );
    const channelIds = [...new Set(configs.map((c: { channel_id: string }) => c.channel_id))];

    const { data: sent } = await supabase
      .from('competitor_sent')
      .select('config_id, video_id, sent_at')
      .in('config_id', configIds)
      .order('sent_at', { ascending: false })
      .limit(200);

    if (!sent || sent.length === 0) return [];

    const videoIds = [...new Set((sent as SentRow[]).map((s) => s.video_id))];

    const { data: videos } = await supabase
      .from('competitor_videos')
      .select('*')
      .in('channel_id', channelIds)
      .in('video_id', videoIds);

    const videoMap = new Map<string, VideoRow>();
    (videos || []).forEach((v: VideoRow) =>
      videoMap.set(`${v.channel_id}:${v.video_id}`, v)
    );

    const result: FeedItem[] = [];
    for (const s of sent as SentRow[]) {
      const cfg = configMap[s.config_id];
      if (!cfg) continue;
      const v = videoMap.get(`${cfg.channel_id}:${s.video_id}`);
      if (!v) continue;
      result.push({
        source_type:   'competitor',
        source_label:  cfg.label || cfg.channel_title,
        video_id:      String(v.video_id ?? ''),
        title:         String(v.title ?? ''),
        channel_title: cfg.channel_title,
        thumbnail_url: String(v.thumbnail_url ?? ''),
        view_count:    Number(v.view_count ?? 0),
        sub_count:     Number(v.sub_count ?? 0),
        ratio:         Number(v.ratio ?? 0),
        duration_s:    Number(v.duration_s ?? 0),
        published_at:  String(v.published_at ?? ''),
        sent_at:       s.sent_at,
      });
    }
    return result;
  }

  const [keywordItems, competitorItems] = await Promise.all([
    buildKeywordFeed(),
    buildCompetitorFeed(),
  ]);

  const all = [...keywordItems, ...competitorItems]
    .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
    .slice(0, 300);

  return Response.json({
    items: all,
    plan,
    competitorLocked: false,
  });
}
