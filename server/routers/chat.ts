import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

function isConversationParticipant(
  conversation: {
    user1Id: string | null;
    user2Id: string | null;
    ngo1Id: string | null;
    ngo2Id: string | null;
  },
  userId: string
) {
  return (
    conversation.user1Id === userId ||
    conversation.user2Id === userId ||
    conversation.ngo1Id === userId ||
    conversation.ngo2Id === userId
  );
}

export const chatRouter = createTRPCRouter({
  
  // Registration: Store generated e2ee keys to User or NGO profile
  registerKeys: protectedProcedure
    .input(z.object({
      publicKey: z.string(),
      encryptedPrivateKey: z.string(),
      keyDerivationSalt: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;
      
      if (user.type === 'ngo') {
        await prisma.nGO.update({
          where: { id: user.id },
          data: {
            publicKey: input.publicKey,
            encryptedPrivateKey: input.encryptedPrivateKey,
            keyDerivationSalt: input.keyDerivationSalt,
          }
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            publicKey: input.publicKey,
            encryptedPrivateKey: input.encryptedPrivateKey,
            keyDerivationSalt: input.keyDerivationSalt,
          }
        });
      }
      return { success: true };
    }),

  // Get current user's encrypted keys
  getMyKeys: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx.session;
      let record: { publicKey: string | null; encryptedPrivateKey: string | null; keyDerivationSalt: string | null; } | null = null;
      
      if (user.type === 'ngo') {
        record = await prisma.nGO.findUnique({ where: { id: user.id }, select: { publicKey: true, encryptedPrivateKey: true, keyDerivationSalt: true }});
      } else {
        record = await prisma.user.findUnique({ where: { id: user.id }, select: { publicKey: true, encryptedPrivateKey: true, keyDerivationSalt: true }});
      }

      if (!record || !record.publicKey) return null;
      return record;
    }),

  startConversation: protectedProcedure
    .input(z.object({
      targetId: z.string(),
      targetType: z.enum(['user', 'ngo']),
      itemRequestId: z.string().optional(),
      initialMessage: z.string().trim().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;
      const myId = user.id;
      const myType = user.type; // 'user' or 'ngo'
      const targetId = input.targetId;
      const targetType = input.targetType;

      if (myId === targetId && myType === targetType) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot start a conversation with yourself.',
        });
      }

      let itemRequestTitle: string | null = null;

      if (input.itemRequestId) {
        if (myType !== 'user') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Only user accounts can offer help on item requests.',
          });
        }

        const itemRequest = await prisma.itemRequest.findUnique({
          where: { id: input.itemRequestId },
          select: {
            id: true,
            requesterId: true,
            title: true,
            status: true,
          },
        });

        if (!itemRequest) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Request not found.' });
        }

        if (itemRequest.status !== 'open') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This request is no longer open.',
          });
        }

        if (itemRequest.requesterId !== targetId || targetType !== 'user') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Conversation target does not match the request owner.',
          });
        }

        itemRequestTitle = itemRequest.title;
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
          itemRequestId: input.itemRequestId ?? null,
          OR: [
            {
              user1Id: myType === 'user' ? myId : null,
              user2Id: targetType === 'user' ? targetId : null,
              ngo1Id: myType === 'ngo' ? myId : null,
              ngo2Id: targetType === 'ngo' ? targetId : null,
            },
            {
              user1Id: targetType === 'user' ? targetId : null,
              user2Id: myType === 'user' ? myId : null,
              ngo1Id: targetType === 'ngo' ? targetId : null,
              ngo2Id: myType === 'ngo' ? myId : null,
            },
          ],
        },
        include: {
          user1: { select: { id: true, fullName: true, publicKey: true } },
          user2: { select: { id: true, fullName: true, publicKey: true } },
          ngo1: { select: { id: true, organizationName: true, publicKey: true } },
          ngo2: { select: { id: true, organizationName: true, publicKey: true } },
          itemRequest: { select: { id: true, title: true, status: true } },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            user1Id: myType === 'user' ? myId : null,
            user2Id: targetType === 'user' ? targetId : null,
            ngo1Id: myType === 'ngo' ? myId : null,
            ngo2Id: targetType === 'ngo' ? targetId : null,
            itemRequestId: input.itemRequestId,
            status: 'PENDING',
          },
          include: {
            user1: { select: { id: true, fullName: true, publicKey: true } },
            user2: { select: { id: true, fullName: true, publicKey: true } },
            ngo1: { select: { id: true, organizationName: true, publicKey: true } },
            ngo2: { select: { id: true, organizationName: true, publicKey: true } },
            itemRequest: { select: { id: true, title: true, status: true } },
          },
        });

        // Send a system message to initiate the request
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: myId,
            senderType: myType,
            content: input.itemRequestId && itemRequestTitle
              ? `Chat request: ${user.name} offered help for "${itemRequestTitle}".`
              : `Chat request: ${user.name} would like to connect regarding a community request.`,
            isSystem: true,
          }
        });
      }

      if (input.itemRequestId && myType === 'user') {
        await prisma.itemResponse.upsert({
          where: {
            donorId_itemRequestId: {
              donorId: myId,
              itemRequestId: input.itemRequestId,
            },
          },
          update: {
            status: 'interested',
            conversationId: conversation.id,
            ...(input.initialMessage ? { message: input.initialMessage } : {}),
          },
          create: {
            donorId: myId,
            itemRequestId: input.itemRequestId,
            conversationId: conversation.id,
            status: 'interested',
            message: input.initialMessage,
          },
        });
      }

      return conversation;
    }),

  acceptConversation: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;
      
      const conv = await prisma.conversation.findUnique({
        where: { id: input.conversationId }
      });

      if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });

      // Verify the user is the receiver (not the one who started it)
      // For simplicity, we just check if they are part of it
      const isParticipant = isConversationParticipant(conv, user.id);
      if (!isParticipant) throw new TRPCError({ code: 'FORBIDDEN' });

      return await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { status: 'ACCEPTED' },
      });
    }),

  getConversations: protectedProcedure
    .query(async ({ ctx }) => {
      const { user } = ctx.session;

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { user1Id: user.id },
            { user2Id: user.id },
            { ngo1Id: user.id },
            { ngo2Id: user.id },
          ]
        },
        include: {
          user1: { select: { id: true, fullName: true, publicKey: true } },
          user2: { select: { id: true, fullName: true, publicKey: true } },
          ngo1: { select: { id: true, organizationName: true, publicKey: true } },
          ngo2: { select: { id: true, organizationName: true, publicKey: true } },
          itemRequest: { select: { id: true, title: true, status: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      return conversations;
    }),

  getMessages: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: input.conversationId },
        select: { user1Id: true, user2Id: true, ngo1Id: true, ngo2Id: true },
      });

      if (!conversation) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!isConversationParticipant(conversation, ctx.session.user.id)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' }
      });
      return messages;
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string(),
      isSystem: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;

      // Check if conversation is accepted if not a system message
      const conv = await prisma.conversation.findUnique({
        where: { id: input.conversationId }
      });

      if (!conv) throw new TRPCError({ code: 'NOT_FOUND' });
      if (!isConversationParticipant(conv, user.id)) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      if (!input.isSystem && conv?.status === 'PENDING') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must wait for the recipient to accept your chat request.',
        });
      }

      const message = await prisma.message.create({
        data: {
          conversationId: input.conversationId,
          senderId: user.id,
          senderType: user.type,
          content: input.content,
          isSystem: !!input.isSystem,
        }
      });

      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() }
      });

      return message;
    }),
});
