import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client-side Supabase wrapper. Requires these env vars to be set in .env:
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let _supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // In dev, warn and export a lightweight noop client so runtime doesn't crash.
  // This allows the UI to render in environments without Supabase configured.
  // eslint-disable-next-line no-console
  console.warn('[supabase] missing NEXT_PUBLIC_SUPABASE_* env vars — exporting noop client');

  const noop: any = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: null }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ data: null, error: new Error('Supabase not configured') }),
    },
    from: () => ({
      select: async () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
      update: async () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({ on: () => ({}) }),
    }),
    removeChannel: () => {},
  };

  _supabase = noop as SupabaseClient;
}

export const supabase: SupabaseClient = _supabase;

export default supabase;
