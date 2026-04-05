/**
 * server/routers/ngo.ts
 * tRPC procedure: ngo.search
 *
 * Uses the raw-SQL repository for PostGIS geo queries (ST_DistanceSphere),
 * consistent with AGENTS.md: raw SQL only for PostGIS / performance-critical paths.
 */
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { findNearbyNGOs } from '@/lib/repositories/ngo';

export const ngoRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        lat:         z.number().min(-90).max(90).nullable().optional(),
        lng:         z.number().min(-180).max(180).nullable().optional(),
        radiusKm:    z.number().min(1).max(500).default(50),
        category:    z.string().default('All Causes'),
        searchQuery: z.string().default(''),
      })
    )
    .query(async ({ input }) => {
      const ngos = await findNearbyNGOs({
        lat: input.lat,
        lng: input.lng,
        radiusKm: input.radiusKm,
        category: input.category,
        searchQuery: input.searchQuery,
      });
      return ngos;
    }),
});
