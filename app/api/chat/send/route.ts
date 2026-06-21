import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRequestRateLimit, rateLimitResponse } from '@/lib/rate-limit';

type Body = { conversation_id: string; encrypted_content: string; nonce: string };

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

export async function POST(request: NextRequest) {
  try {
    const body: Body = await request.json();
    const { conversation_id, encrypted_content, nonce } = body;
    if (!conversation_id || !encrypted_content || !nonce) {
      return NextResponse.json({ error: 'conversation_id, encrypted_content and nonce are required' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = checkRequestRateLimit(request, 'chat-send', 60, 60 * 1000, session.user.id);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversation_id },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!isConversationParticipant(conversation, session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (conversation.status === 'PENDING') {
      return NextResponse.json(
        { error: 'You must wait for the recipient to accept your chat request.' },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation_id,
        senderId: session.user.id,
        senderType: session.user.type,
        content: JSON.stringify({ encrypted_content, nonce }),
      },
    });

    await prisma.conversation.update({
      where: { id: conversation_id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (err: unknown) {
    console.error('chat send error', err);
    const msg = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
