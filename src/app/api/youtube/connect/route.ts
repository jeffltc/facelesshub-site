import { NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getPlanLimits } from '@/lib/subscription';

function buildState(email: string): string {
  const secret = process.env.AUTH_SECRET!;
  const nonce = randomBytes(16).toString('hex');
  const sig = createHmac('sha256', secret).update(`${nonce}:${email}`).digest('hex');
  const payload = JSON.stringify({ nonce, email, sig });
  return Buffer.from(payload).toString('base64url');
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const email = session.user.email;
  const supabase = getSupabase();
  const { limits } = await getPlanLimits(email);

  // Check current channel count against plan limit
  const { count } = await supabase
    .from('connected_channels')
    .select('*', { count: 'exact', head: true })
    .eq('email', email);

  if ((count ?? 0) >= limits.maxConnectedChannels) {
    return NextResponse.json(
      { error: 'Channel limit reached', code: 'CHANNEL_LIMIT_EXCEEDED' },
      { status: 403 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/youtube/connect/callback`;

  const state = buildState(email);

  const params = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID!,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
