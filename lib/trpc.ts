/**
 * lib/trpc.ts
 * Typed tRPC React Query client.
 * Import { trpc } from here to call procedures with full type inference.
 */
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
