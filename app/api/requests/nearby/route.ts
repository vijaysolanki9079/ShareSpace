'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Simple distance calculation using Haversine formula
 * (PostGIS will be used later for better performance)
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radiusKm = parseInt(searchParams.get('radius_km') || '5');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    if (!latitude || !longitude || latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude/longitude parameters' },
        { status: 400 }
      );
    }

    const radiusMeters = radiusKm * 1000;

    // Query all open requests (simple version - PostGIS later)
    const allRequests = await prisma.itemRequest.findMany({
      where: {
        status: 'open',
        ...(category && { category: { name: category } }),
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter by distance using Haversine
    const nearbyRequests = allRequests
      .map((req: any) => ({
        ...req,
        distance: haversineDistance(
          latitude,
          longitude,
          req.latitude,
          req.longitude
        ),
      }))
      .filter((req: any) => req.distance <= radiusMeters)
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, limit)
      .map((req: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { distance, ...rest } = req;
        return {
          ...rest,
          distance: Math.round(distance), // distance in meters
        };
      });

    console.log(
      '[requests/nearby] Found',
      nearbyRequests.length,
      'nearby requests at',
      latitude,
      longitude
    );

    return NextResponse.json({
      success: true,
      count: nearbyRequests.length,
      requests: nearbyRequests,
    });
  } catch (error) {
    console.error('[requests/nearby] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch nearby requests',
      },
      { status: 500 }
    );
  }
}
