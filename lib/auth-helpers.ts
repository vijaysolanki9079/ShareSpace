import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Read the current NextAuth session.
 * Returns an object with `id` and `email` when available, otherwise null.
 */
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return { id: session.user.id ?? null, email: session.user.email ?? null };
    }
  } catch {
    // ignore
  }

  return null;
}
