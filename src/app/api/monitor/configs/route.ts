import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('monitor_configs')
    .select('id, keyword, ratio_min, notify_email, label, active, created_at')
    .eq('owner_email', session.user.email)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { keyword, ratio_min = 10, notify_email, label } = body;

  if (!keyword?.trim()) {
    return Response.json({ error: 'keyword is required' }, { status: 400 });
  }

  const supabase = getSupabase();
  // Free tier: max 3 active monitors per account
  const { count } = await supabase
    .from('monitor_configs')
    .select('*', { count: 'exact', head: true })
    .eq('owner_email', session.user.email)
    .eq('active', true);

  if ((count ?? 0) >= 3) {
    return Response.json({ error: 'Maximum 3 monitors per account' }, { status: 429 });
  }

  const { data, error } = await supabase
    .from('monitor_configs')
    .insert({
      keyword:      keyword.trim().toLowerCase(),
      ratio_min:    Math.max(1, Math.min(100, Number(ratio_min) || 10)),
      notify_email: (notify_email || session.user.email).trim(),
      label:        label?.trim() || null,
      owner_email:  session.user.email,
      active:       true,
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
