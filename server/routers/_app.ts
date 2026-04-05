/**
 * server/routers/_app.ts
 * Root tRPC router — merge all sub-routers here.
 */
import { createTRPCRouter } from '@/server/trpc';
import { ngoRouter } from './ngo';

export const appRouter = createTRPCRouter({
  ngo: ngoRouter,
});

// Export the router type so the client can infer procedure signatures
export type AppRouter = typeof appRouter;
