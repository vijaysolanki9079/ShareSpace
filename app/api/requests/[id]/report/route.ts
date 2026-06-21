'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRequestRateLimitShared, rateLimitResponse } from '@/lib/rate-limit';

/**
 * Report a donation request for inappropriate content, spam, etc.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rateLimit = await checkRequestRateLimitShared(
      request,
      'request-report',
      10,
      60 * 60 * 1000,
      session.user.id
    );
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const { id: requestId } = await params;

    const body = await request.json();
    const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 1000) : '';

    if (!reason) {
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

    if (itemRequest.requesterId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot report your own request' },
        { status: 400 }
      );
    }

    const report = await prisma.report.upsert({
      where: {
        itemRequestId_reporterId: {
          itemRequestId: requestId,
          reporterId: session.user.id,
        },
      },
      update: {
        reason,
        status: 'pending',
      },
      create: {
        itemRequestId: requestId,
        reporterId: session.user.id,
        reporterType: session.user.type,
        reason,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    console.log('[requests/report] Report stored:', {
      reportId: report.id,
      itemRequestId: requestId,
      reason,
      reportedBy: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        report,
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
