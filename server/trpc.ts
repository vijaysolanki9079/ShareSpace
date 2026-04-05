/**
 * server/trpc.ts
 * Core tRPC initialisation: context builder, router factory, and public procedure.
 * Raw SQL (pg) is used for PostGIS queries; Prisma handles standard CRUD.
 */
import { initTRPC } from '@trpc/server';
import { prisma } from '@/lib/prisma';
import superjson from 'superjson';
import { ZodError } from 'zod';

// ─── Context ────────────────────────────────────────────────────────────────
export async function createTRPCContext(opts: { headers: Headers }) {
  return {
    prisma,
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
export const publicProcedure    = t.procedure;
