import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';

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
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;
      
      // Determine columns based on participant types
      const myField = user.type === 'ngo' ? 'ngo1Id' : 'user1Id';
      const targetField = input.targetType === 'ngo' ? 'ngo2Id' : 'user2Id';

      // Check if conversation exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { [myField]: user.id, [targetField]: input.targetId },
            // Swap condition
            { [user.type === 'ngo' ? 'ngo2Id' : 'user2Id']: user.id, [input.targetType === 'ngo' ? 'ngo1Id' : 'user1Id']: input.targetId }
          ]
        },
        include: {
          user1: { select: { id: true, fullName: true, publicKey: true } },
          user2: { select: { id: true, fullName: true, publicKey: true } },
          ngo1: { select: { id: true, organizationName: true, publicKey: true } },
          ngo2: { select: { id: true, organizationName: true, publicKey: true } },
        }
      });

      // Create if it doesn't exist
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            [myField]: user.id,
            [targetField]: input.targetId,
          },
          include: {
            user1: { select: { id: true, fullName: true, publicKey: true } },
            user2: { select: { id: true, fullName: true, publicKey: true } },
            ngo1: { select: { id: true, organizationName: true, publicKey: true } },
            ngo2: { select: { id: true, organizationName: true, publicKey: true } },
          }
        });
      }

      return conversation;
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
      // Validate participation (simplified for brevity)
      const messages = await prisma.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' }
      });
      return messages;
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string(),
      content: z.string(), // E2EE ciphertext
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx.session;

      const message = await prisma.message.create({
        data: {
          conversationId: input.conversationId,
          senderId: user.id,
          senderType: user.type, // 'user' or 'ngo'
          content: input.content,
        }
      });

      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() }
      });

      return message;
    }),
});
