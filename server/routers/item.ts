import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '@/server/trpc';
import { prisma } from '@/lib/prisma';
import { getRenderableImages } from '@/lib/image-src';

export const itemRouter = createTRPCRouter({
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const [
        itemsDonated,
        requestsCreated,
        fulfilledResponses,
        messageCount,
        conversationRows,
        recentRequests,
        recentResponses,
        recentMessages,
      ] = await Promise.all([
        prisma.itemResponse.count({ where: { donorId: userId } }),
        prisma.itemRequest.count({ where: { requesterId: userId } }),
        prisma.itemResponse.count({ where: { donorId: userId, status: 'fulfilled' } }),
        prisma.message.count({
          where: {
            isSystem: false,
            conversation: {
              OR: [
                { user1Id: userId },
                { user2Id: userId },
                { ngo1Id: userId },
                { ngo2Id: userId },
              ],
            },
          },
        }),
        prisma.conversation.findMany({
          where: {
            OR: [
              { user1Id: userId },
              { user2Id: userId },
              { ngo1Id: userId },
              { ngo2Id: userId },
            ],
          },
          select: {
            user1Id: true,
            user2Id: true,
            ngo1Id: true,
            ngo2Id: true,
          },
        }),
        prisma.itemRequest.findMany({
          where: { requesterId: userId },
          select: { id: true, title: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
        prisma.itemResponse.findMany({
          where: { donorId: userId },
          select: {
            id: true,
            status: true,
            createdAt: true,
            itemRequest: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
        prisma.message.findMany({
          where: {
            isSystem: false,
            conversation: {
              OR: [
                { user1Id: userId },
                { user2Id: userId },
                { ngo1Id: userId },
                { ngo2Id: userId },
              ],
            },
          },
          select: { id: true, senderId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 3,
        }),
      ]);

      const connectionIds = new Set<string>();
      for (const conversation of conversationRows) {
        [conversation.user1Id, conversation.user2Id, conversation.ngo1Id, conversation.ngo2Id]
          .filter((id): id is string => Boolean(id) && id !== userId)
          .forEach((id) => connectionIds.add(id));
      }

      const recentActivity = [
        ...recentRequests.map((request) => ({
          id: `request-${request.id}`,
          text: `Request posted: ${request.title}`,
          at: request.createdAt,
        })),
        ...recentResponses.map((response) => ({
          id: `response-${response.id}`,
          text: `${response.status === 'fulfilled' ? 'Fulfilled' : 'Offered help for'}: ${response.itemRequest.title}`,
          at: response.createdAt,
        })),
        ...recentMessages.map((message) => ({
          id: `message-${message.id}`,
          text: message.senderId === userId ? 'You sent a message' : 'New message received',
          at: message.createdAt,
        })),
      ]
        .sort((a, b) => b.at.getTime() - a.at.getTime())
        .slice(0, 5)
        .map((activity) => ({
          id: activity.id,
          text: activity.text,
          at: activity.at.toISOString(),
        }));

      return {
        itemsDonated,
        requestsCreated,
        requestsFulfilled: fulfilledResponses,
        messages: messageCount,
        connections: connectionIds.size,
        recentActivity,
      };
    }),

  // Queries for User's Requests (ItemRequests created by the user)
  getMyRequestFeed: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const requests = await prisma.itemRequest.findMany({
        where: { requesterId: userId },
        include: {
          requester: {
            select: {
              id: true,
              fullName: true,
              image: true,
            },
          },
          ngo: {
            select: {
              id: true,
              organizationName: true,
              image: true,
              isVerified: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return requests.map((request) => ({
        ...request,
        images: getRenderableImages(request.images),
        distance: 0,
        createdAt: request.createdAt.toISOString(),
      }));
    }),

  getMyRequests: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.id !== input.userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

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
      });

      return requests.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category.name,
        condition: 'Good condition', // mock or add to schema later
        status: r.status,
        donor: r.responses.length > 0 ? r.responses[0].donor.fullName : 'No donor yet',
        distance: 'Local', // Distance from you (mocked here or can calculate if user coords exist)
        date: r.createdAt.toISOString(),
        image: getRenderableImages(r.images)[0] || null,
      }));
    }),

  // Queries for User's Donations (ItemResponses where the user is the donor)
  getMyDonations: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.id !== input.userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

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

      return responses.map((r) => ({
        id: r.id,
        requestId: r.itemRequest.id,
        title: r.itemRequest.title,
        description: r.itemRequest.description,
        category: r.itemRequest.category.name,
        status: r.status === 'fulfilled' ? 'completed' : 'pending',
        requestStatus: r.itemRequest.status,
        location: r.itemRequest.locationName || 'Location not specified',
        date: r.createdAt.toISOString(),
        img: getRenderableImages(r.itemRequest.images)[0] || null,
      }));
    }),
});
