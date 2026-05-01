/**
 * server/routers/_app.ts
 * Root tRPC router — merge all sub-routers here.
 */
import { createTRPCRouter } from '@/server/trpc';
import { ngoRouter } from './ngo';
import { searchRouter } from './search';
import { chatRouter } from './chat';
import { itemRouter } from './item';

export const appRouter = createTRPCRouter({
  ngo: ngoRouter,
  search: searchRouter,
  chat: chatRouter,
  item: itemRouter,
});

// Export the router type so the client can infer procedure signatures
export type AppRouter = typeof appRouter;
