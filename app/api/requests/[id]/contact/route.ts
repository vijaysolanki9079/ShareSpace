import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Send a contact notification to a requester
 * This is a placeholder - in production, this would send email/SMS/notification
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    if (session.user.type !== 'user') {
      return NextResponse.json(
        { error: 'Only user accounts can offer help on item requests' },
        { status: 403 }
      );
    }

    const { id: requestId } = await params;
    const body = await request.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.slice(0, 500) : undefined;

    // Verify the request exists
    const itemRequest = await prisma.itemRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!itemRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Prevent self-contact
    if (itemRequest.requester.id === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot contact yourself' },
        { status: 400 }
      );
    }

    await prisma.itemResponse.upsert({
      where: {
        donorId_itemRequestId: {
          donorId: session.user.id,
          itemRequestId: requestId,
        },
      },
      update: {
        status: 'interested',
        ...(message ? { message } : {}),
      },
      create: {
        donorId: session.user.id,
        itemRequestId: requestId,
        status: 'interested',
        message,
      },
    });

    console.log('[requests/contact] Interest registered:', {
      requestId,
      contactFrom: session.user.id,
      contactTo: itemRequest.requester.id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification sent! The requester will be notified of your interest.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[requests/contact] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send notification',
      },
      { status: 500 }
    );
  }
}
