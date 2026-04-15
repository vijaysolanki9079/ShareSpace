import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? '';

if (!supabaseUrl || !supabaseServiceKey) {
  // Server-side warn; do not throw to avoid build failures in environments
  // without the service key. Ensure you add `SUPABASE_SERVICE_ROLE_KEY` to
  // your deployment environment for server-side operations.
  // eslint-disable-next-line no-console
  console.warn('[supabase-server] SUPABASE_SERVICE_ROLE_KEY or URL not found in env');
}

export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export default supabaseAdmin;
