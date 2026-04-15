'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Report a donation request for inappropriate content, spam, etc.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    const { id: requestId } = await params;

    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Please provide a reason for reporting' },
        { status: 400 }
      );
    }

    // Verify the request exists
    const itemRequest = await prisma.itemRequest.findUnique({
      where: { id: requestId },
    });

    if (!itemRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Store report (in production, this would go to a moderation queue)
    // For now, just log it
    console.log('[requests/report] New report:', {
      requestId,
      reason,
      reportedBy: session?.user?.id || 'anonymous',
      reportedAt: new Date().toISOString(),
    });

    // TODO: Create a Report model in Prisma and store reports
    // For now, we just acknowledge receipt

    return NextResponse.json(
      {
        success: true,
        message: 'Report submitted successfully. Thank you for helping keep the community safe.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[requests/report] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit report',
      },
      { status: 500 }
    );
  }
}
