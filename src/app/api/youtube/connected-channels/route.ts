import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getPlanLimits } from '@/lib/subscription';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.user.email;
  const supabase = getSupabase();
  const { plan, limits } = await getPlanLimits(email);

  const { data, error } = await supabase
    .from('connected_channels')
    .select('channel_id, channel_title, channel_thumbnail, created_at')
    .eq('email', email)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('connected-channels GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
  }

  return NextResponse.json({
    channels: data ?? [],
    maxChannels: limits.maxConnectedChannels,
    plan,
  });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.user.email;
  const channelId = request.nextUrl.searchParams.get('channelId');
  if (!channelId) {
    return NextResponse.json({ error: 'channelId required' }, { status: 400 });
  }

  const supabase = getSupabase();

  const { error } = await supabase
    .from('connected_channels')
    .delete()
    .eq('email', email)
    .eq('channel_id', channelId);

  if (error) {
    console.error('connected-channels DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove channel' }, { status: 500 });
  }

  // Clear translator_settings.selected_channel_id if it matches the deleted channel
  const { data: settings } = await supabase
    .from('translator_settings')
    .select('selected_channel_id')
    .eq('email', email)
    .single();

  if (settings?.selected_channel_id === channelId) {
    await supabase
      .from('translator_settings')
      .update({ selected_channel_id: null })
      .eq('email', email);
  }

  return NextResponse.json({ ok: true });
}
