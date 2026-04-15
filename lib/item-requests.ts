/**
 * Item Request Server-Side Helpers
 * Handles database operations for item requests
 * Note: PostGIS queries will be added in a future optimization
 */

import { prisma } from '@/lib/prisma';

export interface NearbyRequest {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
  };
  images: string[];
  latitude: number;
  longitude: number;
  locationName: string | null;
  distance?: number; // in meters
  requester: {
    id: string;
    fullName: string;
    image: string | null;
  };
  status: string;
  createdAt: Date;
}

/**
 * Simple distance calculation using Haversine formula
 * PostGIS queries coming in future optimization
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

/**
 * Find nearby item requests within a radius
 * Uses Haversine distance calculation (PostGIS optimization coming soon)
 */
export async function findNearbyRequests(
  userLatitude: number,
  userLongitude: number,
  radiusMeters: number = 5000, // 5km default
  limit: number = 50,
  category?: string
): Promise<NearbyRequest[]> {
  try {
    // Query all open requests
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
      take: limit * 2, // Fetch more to filter by distance
    });

    // Filter by distance using Haversine
    const nearbyRequests = allRequests
      .map((req) => ({
        ...req,
        distance: haversineDistance(
          userLatitude,
          userLongitude,
          req.latitude,
          req.longitude
        ),
      }))
      .filter((req) => req.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearbyRequests;
  } catch (error) {
    console.error('[itemRequests] Error finding nearby requests:', error);
    throw error;
  }
}

/**
 * Get detailed item request with responses
 */
export async function getItemRequestDetail(requestId: string) {
  try {
    const request = await prisma.itemRequest.findUnique({
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
          },
        },
        responses: {
          where: { status: 'interested' },
          include: {
            donor: {
              select: {
                id: true,
                fullName: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return request;
  } catch (error) {
    console.error('[itemRequests] Error getting request detail:', error);
    throw error;
  }
}

/**
 * Create a new item request
 */
export async function createItemRequest(
  requesterId: string,
  data: {
    title: string;
    description: string;
    categoryId: string;
    images: string[];
    latitude: number;
    longitude: number;
    locationName?: string;
    radius?: number;
    ngoId?: string;
  }
) {
  try {
    const request = await prisma.itemRequest.create({
      data: {
        requesterId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        images: data.images,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
        radius: data.radius || 5000,
        ngoId: data.ngoId,
      },
      include: {
        category: true,
        requester: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });

    return request;
  } catch (error) {
    console.error('[itemRequests] Error creating request:', error);
    throw error;
  }
}

/**
 * Get or create item categories
 */
export async function getOrCreateCategories() {
  const defaultCategories = [
    { name: 'furniture', description: 'Beds, tables, chairs, sofas' },
    { name: 'clothes', description: 'Used clothing and accessories' },
    { name: 'electronics', description: 'Old gadgets, devices, appliances' },
    { name: 'toys', description: 'Children toys and games' },
    { name: 'books', description: 'Used books and educational materials' },
    { name: 'tools', description: 'Hand tools and equipment' },
    { name: 'kitchen', description: 'Kitchen utensils and cookware' },
    { name: 'sports', description: 'Sports equipment and gear' },
    { name: 'other', description: 'Other items' },
  ];

  try {
    const categories = await Promise.all(
      defaultCategories.map((cat) =>
        prisma.itemCategory.upsert({
          where: { name: cat.name },
          update: {},
          create: cat,
        })
      )
    );

    return categories;
  } catch (error) {
    console.error('[itemRequests] Error managing categories:', error);
    throw error;
  }
}

/**
 * Update item request status
 */
export async function updateRequestStatus(
  requestId: string,
  status: 'open' | 'fulfilled' | 'closed'
) {
  try {
    const request = await prisma.itemRequest.update({
      where: { id: requestId },
      data: { status },
    });

    return request;
  } catch (error) {
    console.error('[itemRequests] Error updating request status:', error);
    throw error;
  }
}

/**
 * Mark response as fulfilled
 */
export async function fulfillItemResponse(responseId: string) {
  try {
    const response = await prisma.itemResponse.update({
      where: { id: responseId },
      data: { status: 'fulfilled' },
      include: {
        itemRequest: true,
        donor: { select: { id: true, fullName: true } },
      },
    });

    return response;
  } catch (error) {
    console.error('[itemRequests] Error fulfilling response:', error);
    throw error;
  }
}
