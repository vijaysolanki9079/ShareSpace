import { initTRPC, TRPCError } from '@trpc/server';
import { prisma } from '@/lib/prisma';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ─── Context ────────────────────────────────────────────────────────────────
export async function createTRPCContext(opts: { headers: Headers }) {
  const session = await getServerSession(authOptions);
  return {
    prisma,
    session,
    ...opts,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// ─── tRPC instance ──────────────────────────────────────────────────────────
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Reusable middleware that checks if users are logged in
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
