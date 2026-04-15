import { supabase } from './supabase';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Try Supabase auth first, then fall back to NextAuth session for compatibility.
 * Returns an object with `id` and `email` when available, otherwise null.
 */
export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    const supaUser = data?.user ?? null;
    if (supaUser) return { id: supaUser.id, email: supaUser.email ?? null };
  } catch (e) {
    // ignore and try NextAuth
  }

  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (session?.user) {
      return { id: (session.user as any).id ?? null, email: session.user.email ?? null };
    }
  } catch (e) {
    // ignore
  }

  return null;
}
