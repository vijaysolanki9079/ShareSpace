import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRequestRateLimitShared, rateLimitResponse } from '@/lib/rate-limit';

type Body = { participants: string[]; title?: string };

async function resolveParticipant(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true },
  });

  if (user) {
    return { id: user.id, type: 'user' as const, name: user.fullName };
  }

  const ngo = await prisma.nGO.findUnique({
    where: { id },
    select: { id: true, organizationName: true },
  });

  if (ngo) {
    return { id: ngo.id, type: 'ngo' as const, name: ngo.organizationName };
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: Body = await request.json();
    const { participants, title } = body;

    if (!Array.isArray(participants) || participants.length === 0) {
      return NextResponse.json({ error: 'participants array required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = await checkRequestRateLimitShared(request, 'chat-create', 30, 60 * 1000, session.user.id);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const target = await resolveParticipant(participants[0]);
    if (!target) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    if (target.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot start a conversation with yourself' }, { status: 400 });
    }

    const myType = session.user.type;
    const myId = session.user.id;

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            user1Id: myType === 'user' ? myId : null,
            user2Id: target.type === 'user' ? target.id : null,
            ngo1Id: myType === 'ngo' ? myId : null,
            ngo2Id: target.type === 'ngo' ? target.id : null,
          },
          {
            user1Id: target.type === 'user' ? target.id : null,
            user2Id: myType === 'user' ? myId : null,
            ngo1Id: target.type === 'ngo' ? target.id : null,
            ngo2Id: myType === 'ngo' ? myId : null,
          },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id: myType === 'user' ? myId : target.type === 'user' ? target.id : null,
          user2Id: myType === 'user' ? (target.type === 'user' ? target.id : null) : null,
          ngo1Id: myType === 'ngo' ? myId : target.type === 'ngo' ? target.id : null,
          ngo2Id: myType === 'ngo' ? (target.type === 'ngo' ? target.id : null) : null,
          initiatorId: myId,
          status: 'PENDING',
        },
      });
    }

    if (title) {
      const hasMessages = await prisma.message.count({
        where: { conversationId: conversation.id },
      });

      if (hasMessages === 0) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: myId,
            senderType: myType,
            content: `Chat request: ${title}`,
            isSystem: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: title ?? `Chat with ${target.name}`,
        status: conversation.status,
      },
    }, { status: conversation.status === 'PENDING' ? 202 : 200 });
  } catch (err: unknown) {
    console.error('create conversation error', err);
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
