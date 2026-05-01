import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { prisma } from '@/lib/prisma';

export const itemRouter = createTRPCRouter({
  // Queries for User's Requests (ItemRequests created by the user)
  getMyRequests: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const requests = await prisma.itemRequest.findMany({
        where: { requesterId: input.userId },
        include: {
          category: true,
          responses: {
            include: { donor: true },
            take: 1, // just get one donor for display purposes
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return requests.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category.name,
        condition: 'Good condition', // mock or add to schema later
        status: r.status,
        donor: r.responses.length > 0 ? r.responses[0].donor.fullName : 'No donor yet',
        distance: 'Local', // Distance from you (mocked here or can calculate if user coords exist)
        date: r.createdAt.toISOString(),
        image: r.images[0] || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
      }));
    }),

  // Queries for User's Donations (ItemResponses where the user is the donor)
  getMyDonations: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const responses = await prisma.itemResponse.findMany({
        where: { donorId: input.userId },
        include: {
          itemRequest: {
            include: { category: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return responses.map((r: any) => ({
        id: r.id,
        title: r.itemRequest.title,
        category: r.itemRequest.category.name,
        status: r.status === 'fulfilled' ? 'completed' : 'pending',
        date: r.createdAt.toISOString(),
        img: r.itemRequest.images[0] || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300',
      }));
    }),
});
