import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createItemRequest } from '@/lib/item-requests';
import { prisma } from '@/lib/prisma';
import { CreateItemRequestSchema } from '@/lib/validation';
import { checkRequestRateLimitShared, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      );
    }

    const rateLimit = await checkRequestRateLimitShared(request, 'request-create', 20, 60 * 60 * 1000, session.user.id);
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    const parsed = CreateItemRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Please check the request details and try again.',
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Verify category exists
    const category = await prisma.itemCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Create the request
    const itemRequest = await createItemRequest(session.user.id, {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      images: data.images,
      latitude: data.latitude,
      longitude: data.longitude,
      locationName: data.locationName || undefined,
      radius: data.radius,
      ngoId: data.ngoId || undefined,
    });

    console.log('[requests/create] Request created:', itemRequest.id, 'by', session.user.id);

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
        error: 'Failed to create item request',
      },
      { status: 500 }
    );
  }
}
