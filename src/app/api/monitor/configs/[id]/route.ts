import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from('monitor_configs')
    .update({ active: false })
    .eq('id', id)
    .eq('owner_email', session.user.email); // only update own records

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
}
