import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  // Step 1: all configs for this user (active + inactive — for historical access)
  const { data: configs, error: cfgErr } = await supabase
    .from('monitor_configs')
    .select('id, keyword, label')
    .eq('owner_email', session.user.email);

  if (cfgErr) return Response.json({ error: cfgErr.message }, { status: 500 });
  if (!configs || configs.length === 0) return Response.json([]);

  const configIds = configs.map((c) => c.id);
  const configMap = Object.fromEntries(configs.map((c) => [c.id, c]));

  // Step 2: sent records for those configs (newest first, limit 200)
  const { data: sent, error: sentErr } = await supabase
    .from('monitor_sent')
    .select('config_id, video_id, sent_at')
    .in('config_id', configIds)
    .order('sent_at', { ascending: false })
    .limit(200);

  if (sentErr) return Response.json({ error: sentErr.message }, { status: 500 });
  if (!sent || sent.length === 0) return Response.json([]);

  // Step 3: video metadata
  const videoIds = [...new Set(sent.map((s) => s.video_id))];
  const { data: videos, error: vidErr } = await supabase
    .from('keyword_videos')
    .select('*')
    .in('video_id', videoIds);

  if (vidErr) return Response.json({ error: vidErr.message }, { status: 500 });

  // Build lookup by "keyword:video_id"
  const videoMap = new Map<string, Record<string, unknown>>();
  (videos || []).forEach((v) => videoMap.set(`${v.keyword}:${v.video_id}`, v));

  // Merge sent records with video metadata
  const feed = sent
    .map((s) => {
      const cfg = configMap[s.config_id];
      if (!cfg) return null;
      const video = videoMap.get(`${cfg.keyword}:${s.video_id}`);
      if (!video) return null;
      return { ...video, sent_at: s.sent_at, config_label: cfg.label };
    })
    .filter(Boolean);

  return Response.json(feed);
}
