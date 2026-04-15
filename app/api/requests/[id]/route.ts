'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;

    const itemRequest = await prisma.itemRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            image: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        responses: {
          where: { status: { not: 'no_longer_interested' } },
          include: {
            donor: {
              select: {
                id: true,
                fullName: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!itemRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(itemRequest);
  } catch (error) {
    console.error('[requests/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request details' },
      { status: 500 }
    );
  }
}
