'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createItemRequest, getOrCreateCategories } from '@/lib/item-requests';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      images,
      latitude,
      longitude,
      locationName,
      radius,
      ngoId,
    } = body;

    // Validation
    if (!title || !description || !categoryId || !latitude || !longitude) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: title, description, categoryId, latitude, longitude',
        },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid latitude/longitude values' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.itemCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Create the request
    const itemRequest = await createItemRequest(userId, {
      title,
      description,
      categoryId,
      images: images || [],
      latitude,
      longitude,
      locationName,
      radius: radius || 5000,
      ngoId,
    });

    console.log('[requests/create] Request created:', itemRequest.id, 'by', userId);

    return NextResponse.json(
      {
        success: true,
        requestId: itemRequest.id,
        message: 'Item request created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[requests/create] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create item request',
      },
      { status: 500 }
    );
  }
}
