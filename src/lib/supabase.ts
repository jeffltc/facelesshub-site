import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-only client using service role key (bypasses RLS)
// Only use in API routes, never in client components
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    }
    _client = createClient(url, key, { auth: { persistSession: false } });
  }
  return _client;
}
