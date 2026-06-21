import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRenderableImages } from '@/lib/image-src';
import { query } from '@/lib/server-db';

const LEGACY_FAKE_START = new Date('2026-05-01T07:52:19.000Z');
const LEGACY_FAKE_END = new Date('2026-05-01T07:52:20.000Z');

type NearbyRequestRow = {
  id: string;
  requesterId: string;
  title: string;
  description: string;
  categoryId: string;
  images: string[];
  latitude: number;
  longitude: number;
  locationName: string | null;
  radius: number;
  status: string;
  ngoId: string | null;
  createdAt: Date;
  updatedAt: Date;
  distance: number;
  requester: {
    id: string;
    fullName: string;
    image: string | null;
  };
  ngo: {
    id: string;
    organizationName: string;
    image: string | null;
    isVerified: boolean;
  } | null;
  category: {
    id: string;
    name: string;
  };
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitudeParam = searchParams.get('latitude');
    const longitudeParam = searchParams.get('longitude');
    const hasCoordinates = latitudeParam !== null || longitudeParam !== null;
    const latitude = Number(latitudeParam);
    const longitude = Number(longitudeParam);
    const radiusKm = Math.min(Math.max(Number(searchParams.get('radius_km') || '5'), 1), 25);
    const category = searchParams.get('category');
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || '50'), 1), 100);
    const includeSeedData = searchParams.get('include_seed') === 'true';

    if (hasCoordinates && (
      latitudeParam === null ||
      longitudeParam === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    )) {
      return NextResponse.json(
        { error: 'Invalid latitude/longitude parameters' },
        { status: 400 }
      );
    }

    const radiusMeters = radiusKm * 1000;

    if (hasCoordinates) {
      // PostGIS keeps nearby search in the database instead of loading every
      // open request into application memory.
      const nearbyRows = await query<NearbyRequestRow>(
        `
          SELECT
            ir.id,
            ir."requesterId",
            ir.title,
            ir.description,
            ir."categoryId",
            ir.images,
            ir.latitude,
            ir.longitude,
            ir."locationName",
            ir.radius,
            ir.status,
            ir."ngoId",
            ir."createdAt",
            ir."updatedAt",
            ST_Distance(
              ir.location_geom::geography,
              ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
            ) AS distance,
            json_build_object(
              'id', requester.id,
              'fullName', requester."fullName",
              'image', requester.image
            ) AS requester,
            CASE
              WHEN ngo.id IS NULL THEN NULL
              ELSE json_build_object(
                'id', ngo.id,
                'organizationName', ngo."organizationName",
                'image', ngo.image,
                'isVerified', ngo."isVerified"
              )
            END AS ngo,
            json_build_object(
              'id', category.id,
              'name', category.name
            ) AS category
          FROM "ItemRequest" ir
          JOIN "User" requester ON requester.id = ir."requesterId"
          JOIN "ItemCategory" category ON category.id = ir."categoryId"
          LEFT JOIN "NGO" ngo ON ngo.id = ir."ngoId"
          WHERE ir.status = 'open'
            AND ($4::text IS NULL OR ir."categoryId" = $4)
            AND (
              $5::boolean
              OR NOT (ir."createdAt" >= $6::timestamp AND ir."createdAt" < $7::timestamp)
            )
            AND ir.location_geom IS NOT NULL
            AND ST_DWithin(
              ir.location_geom::geography,
              ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
              LEAST($3::double precision, ir.radius::double precision)
            )
          ORDER BY distance ASC
          LIMIT $8
        `,
        [
          latitude,
          longitude,
          radiusMeters,
          category || null,
          includeSeedData,
          LEGACY_FAKE_START,
          LEGACY_FAKE_END,
          limit,
        ]
      );

      const requests = nearbyRows.rows.map((req) => ({
        ...req,
        images: getRenderableImages(req.images),
        distance: Math.round(Number(req.distance)),
      }));

      return NextResponse.json({
        success: true,
        count: requests.length,
        requests,
      });
    }

    // Query all open requests (simple version - PostGIS later)
    const allRequests = await prisma.itemRequest.findMany({
      where: {
        status: 'open',
        ...(category && { categoryId: category }),
        ...(!includeSeedData && {
          NOT: {
            createdAt: {
              gte: LEGACY_FAKE_START,
              lt: LEGACY_FAKE_END,
            },
          },
        }),
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

    const requests = allRequests.slice(0, limit).map((req) => {
      return {
        ...req,
        images: getRenderableImages(req.images),
      };
    });

    console.log(
      hasCoordinates ? '[requests/nearby] Found' : '[requests/nearby] Found all',
      requests.length,
      hasCoordinates ? 'nearby requests at' : 'open requests',
      hasCoordinates ? latitude : '',
      hasCoordinates ? longitude : ''
    );

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests,
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
