import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

function parseEncryptedContent(content: string) {
  try {
    const parsed = JSON.parse(content) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'encrypted_content' in parsed &&
      'nonce' in parsed &&
      typeof parsed.encrypted_content === 'string' &&
      typeof parsed.nonce === 'string'
    ) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = request.nextUrl.searchParams.get('conversation_id');
    if (!conversationId) {
      return NextResponse.json({ error: 'conversation_id is required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { user1Id: true, user2Id: true, ngo1Id: true, ngo2Id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!isConversationParticipant(conversation, session.user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      messages: messages.map((message) => {
        const encrypted = message.isSystem ? null : parseEncryptedContent(message.content);

        return {
          id: message.id,
          sender_id: message.senderId,
          conversation_id: message.conversationId,
          encrypted_content: encrypted?.encrypted_content ?? message.content,
          nonce: encrypted?.nonce ?? '',
          text: message.isSystem ? message.content : undefined,
          is_system: message.isSystem,
          created_at: message.createdAt.toISOString(),
        };
      }),
    });
  } catch (error) {
    console.error('fetch messages error', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
