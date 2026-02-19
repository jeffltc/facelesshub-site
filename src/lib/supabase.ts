import { createClient } from '@supabase/supabase-js';

// Server-only client using service role key (bypasses RLS)
// Only use in API routes, never in client components
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
