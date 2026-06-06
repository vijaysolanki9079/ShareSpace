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
    const latitudeParam = searchParams.get('latitude');
    const longitudeParam = searchParams.get('longitude');
    const latitude = Number(latitudeParam);
    const longitude = Number(longitudeParam);
    const radiusKm = Math.min(Math.max(Number(searchParams.get('radius_km') || '5'), 1), 25);
    const category = searchParams.get('category');
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || '50'), 1), 100);

    if (
      latitudeParam === null ||
      longitudeParam === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
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
        ngo: {
          select: {
            id: true,
            organizationName: true,
            image: true,
            isVerified: true,
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
      .map((req) => ({
        ...req,
        distance: haversineDistance(
          latitude,
          longitude,
          req.latitude,
          req.longitude
        ),
      }))
      .filter((req) => req.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)
      .map((req) => {
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
        error: 'Failed to fetch nearby requests',
      },
      { status: 500 }
    );
  }
}
