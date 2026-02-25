import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { google } from 'googleapis';
import { getSupabase } from '@/lib/supabase';
import { getPlanLimits } from '@/lib/subscription';

function htmlResponse(script: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>${script}</script></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function postMessageAndClose(type: string, payload: Record<string, string>): NextResponse {
  const data = JSON.stringify({ type, ...payload });
  return htmlResponse(
    `try{window.opener&&window.opener.postMessage(${data},window.location.origin);}catch(e){}window.close();`
  );
}

function verifyState(state: string): { email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    const { nonce, email, sig } = payload as { nonce: string; email: string; sig: string };
    const secret = process.env.AUTH_SECRET!;
    const expected = createHmac('sha256', secret).update(`${nonce}:${email}`).digest('hex');
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return { email };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  if (errorParam) {
    return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: errorParam });
  }

  if (!code || !state) {
    return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'Missing code or state' });
  }

  // Verify CSRF state
  const verified = verifyState(state);
  if (!verified) {
    return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'Invalid state' });
  }
  const { email } = verified;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const redirectUri = `${siteUrl}/api/youtube/connect/callback`;

  // Exchange code for tokens
  let accessToken: string;
  let refreshToken: string | undefined;
  let expiresAt: string;

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Token exchange failed:', body);
      return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'Token exchange failed' });
    }

    const data = await res.json();
    accessToken = data.access_token as string;
    refreshToken = data.refresh_token as string | undefined;
    expiresAt = new Date(Date.now() + (data.expires_in as number) * 1000).toISOString();
  } catch (e) {
    console.error('Token exchange error:', e);
    return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'Token exchange error' });
  }

  // Get channel info using the new token
  let channelId: string;
  let channelTitle: string;
  let channelThumbnail: string;

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const channelRes = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
      maxResults: 1,
    });

    const ch = channelRes.data.items?.[0];
    if (!ch?.id) {
      return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'No channel found for this account' });
    }

    channelId = ch.id;
    channelTitle = ch.snippet?.title ?? '';
    channelThumbnail =
      ch.snippet?.thumbnails?.default?.url ??
      ch.snippet?.thumbnails?.medium?.url ??
      '';
  } catch (e) {
    console.error('Channel info fetch error:', e);
    return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'Failed to get channel info' });
  }

  // Re-check plan limit (race condition guard)
  const supabase = getSupabase();
  const { limits } = await getPlanLimits(email);

  const { count, error: countError } = await supabase
    .from('connected_channels')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .neq('channel_id', channelId); // upsert of same channel is always OK

  if (!countError && (count ?? 0) >= limits.maxConnectedChannels) {
    return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'CHANNEL_LIMIT_EXCEEDED' });
  }

  // Upsert into connected_channels
  const upsertPayload: Record<string, string | undefined> = {
    email,
    channel_id: channelId,
    channel_title: channelTitle,
    channel_thumbnail: channelThumbnail,
    access_token: accessToken,
    token_expires_at: expiresAt,
  };
  // Only write refresh_token if present (don't overwrite existing one with undefined)
  if (refreshToken) {
    upsertPayload.refresh_token = refreshToken;
  }

  const { error: upsertError } = await supabase
    .from('connected_channels')
    .upsert(upsertPayload, { onConflict: 'email,channel_id' });

  if (upsertError) {
    console.error('connected_channels upsert error:', upsertError);
    return postMessageAndClose('CHANNEL_CONNECT_ERROR', { message: 'Failed to save channel' });
  }

  return postMessageAndClose('CHANNEL_CONNECTED', {
    channelId,
    channelTitle,
  });
}
