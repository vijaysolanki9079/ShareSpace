import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function participantName(conversation: {
  user1: { id: string; fullName: string } | null;
  user2: { id: string; fullName: string } | null;
  ngo1: { id: string; organizationName: string } | null;
  ngo2: { id: string; organizationName: string } | null;
}, currentUserId: string) {
  const participants = [
    conversation.user1 ? { id: conversation.user1.id, name: conversation.user1.fullName } : null,
    conversation.user2 ? { id: conversation.user2.id, name: conversation.user2.fullName } : null,
    conversation.ngo1 ? { id: conversation.ngo1.id, name: conversation.ngo1.organizationName } : null,
    conversation.ngo2 ? { id: conversation.ngo2.id, name: conversation.ngo2.organizationName } : null,
  ].filter((item): item is { id: string; name: string } => Boolean(item));

  return participants.find((item) => item.id !== currentUserId)?.name ?? 'Conversation';
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
          { ngo1Id: session.user.id },
          { ngo2Id: session.user.id },
        ],
      },
      include: {
        user1: { select: { id: true, fullName: true } },
        user2: { select: { id: true, fullName: true } },
        ngo1: { select: { id: true, organizationName: true } },
        ngo2: { select: { id: true, organizationName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        title: participantName(conversation, session.user.id),
        status: conversation.status,
        updatedAt: conversation.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('fetch conversations error', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
