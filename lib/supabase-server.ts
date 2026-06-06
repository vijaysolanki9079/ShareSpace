import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? '';
let supabaseAdmin: SupabaseClient | null = null;

if (!supabaseUrl || !supabaseServiceKey) {
  // Server-side warn; do not throw to avoid build failures in environments
  // without the service key. Ensure you add `SUPABASE_SERVICE_ROLE_KEY` to
  // your deployment environment for server-side operations.
  // eslint-disable-next-line no-console
  console.warn('[supabase-server] SUPABASE_SERVICE_ROLE_KEY or URL not found in env');
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase server credentials are not configured.');
  }

  supabaseAdmin ??= createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  return supabaseAdmin;
}

export default getSupabaseAdmin;
