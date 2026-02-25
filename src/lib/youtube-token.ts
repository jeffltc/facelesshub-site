import { getSupabase } from './supabase';

/**
 * Returns a valid access_token for the given (email, channelId) pair.
 * Refreshes the token if it is within 60 s of expiry.
 *
 * Throws named errors:
 *   CHANNEL_NOT_CONNECTED   — no row in connected_channels
 *   CHANNEL_TOKEN_EXPIRED_NO_REFRESH — token expired and no refresh_token stored
 *   CHANNEL_REFRESH_FAILED  — Google refresh call failed
 */
export async function getValidChannelToken(
  email: string,
  channelId: string
): Promise<string> {
  const supabase = getSupabase();

  const { data: row, error } = await supabase
    .from('connected_channels')
    .select('access_token, refresh_token, token_expires_at')
    .eq('email', email)
    .eq('channel_id', channelId)
    .single();

  if (error || !row) {
    const err = new Error('Channel not connected');
    err.name = 'CHANNEL_NOT_CONNECTED';
    throw err;
  }

  const expiresAt = row.token_expires_at ? new Date(row.token_expires_at).getTime() : 0;
  const now = Date.now();

  // Still valid (> 60 s remaining)
  if (expiresAt > now + 60_000) {
    return row.access_token as string;
  }

  // Need to refresh
  if (!row.refresh_token) {
    const err = new Error('Channel token expired and no refresh token available');
    err.name = 'CHANNEL_TOKEN_EXPIRED_NO_REFRESH';
    throw err;
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: row.refresh_token as string,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Channel token refresh failed:', body);
    const err = new Error('Channel token refresh failed');
    err.name = 'CHANNEL_REFRESH_FAILED';
    throw err;
  }

  const data = await res.json();
  const newAccessToken: string = data.access_token;
  const newExpiresAt = new Date(Date.now() + (data.expires_in as number) * 1000).toISOString();

  const updatePayload: Record<string, string> = {
    access_token: newAccessToken,
    token_expires_at: newExpiresAt,
  };
  if (data.refresh_token) {
    updatePayload.refresh_token = data.refresh_token as string;
  }

  await supabase
    .from('connected_channels')
    .update(updatePayload)
    .eq('email', email)
    .eq('channel_id', channelId);

  return newAccessToken;
}
