'use server';

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

    const { id: requestId } = await params;

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

    // Log the contact attempt (in production, send actual notification)
    console.log('[requests/contact] New contact:', {
      requestId,
      contactFrom: session.user.id,
      contactTo: itemRequest.requester.id,
      requesterEmail: itemRequest.requester.email,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send email/notification to requester
    // TODO: Create ContactNotification model for tracking

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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send notification',
      },
      { status: 500 }
    );
  }
}
