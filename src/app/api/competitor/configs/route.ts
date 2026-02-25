import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getPlanLimits } from '@/lib/subscription';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const [{ data, error }, { plan, limits }] = await Promise.all([
    supabase
      .from('competitor_configs')
      .select('id, channel_id, channel_title, channel_url, ratio_min, notify_email, label, active, created_at')
      .eq('owner_email', session.user.email)
      .eq('active', true)
      .order('created_at', { ascending: false }),
    getPlanLimits(session.user.email),
  ]);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({
    configs: data,
    plan,
    maxCompetitorMonitors: limits.competitorMonitors,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan, limits } = await getPlanLimits(session.user.email);

  const supabase = getSupabase();
  const { count } = await supabase
    .from('competitor_configs')
    .select('*', { count: 'exact', head: true })
    .eq('owner_email', session.user.email)
    .eq('active', true);

  if ((count ?? 0) >= limits.competitorMonitors) {
    return Response.json(
      {
        error: `Your ${plan} plan allows up to ${limits.competitorMonitors} competitor monitors. Upgrade to add more.`,
      },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { channelId, channelTitle, channelUrl, ratioMin = 10, notifyEmail, label } = body;

  if (!channelId?.trim()) return Response.json({ error: 'channelId is required' }, { status: 400 });
  if (!channelTitle?.trim()) return Response.json({ error: 'channelTitle is required' }, { status: 400 });
  if (!channelUrl?.trim()) return Response.json({ error: 'channelUrl is required' }, { status: 400 });

  const { data, error } = await supabase
    .from('competitor_configs')
    .insert({
      owner_email:   session.user.email,
      channel_id:    channelId.trim(),
      channel_title: channelTitle.trim(),
      channel_url:   channelUrl.trim(),
      ratio_min:     Math.max(1, Math.min(100, Number(ratioMin) || 10)),
      notify_email:  (notifyEmail || session.user.email).trim(),
      label:         label?.trim() || null,
      active:        true,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
