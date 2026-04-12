/* eslint-disable @typescript-eslint/no-explicit-any */
import { createTRPCRouter, publicProcedure } from '@/server/trpc';
import { z } from 'zod';
import {
  deduplicateResults,
  rankResults,
  parseAddress,
  SearchPerformanceMonitor,
} from '@/lib/search-utils';

export interface LocationSuggestion {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type: 'city' | 'area' | 'street' | 'other';
}

const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const API_TIMEOUT = 5000; // 5 seconds timeout

/**
 * Determine location type based on OSM data
 */
function getLocationType(osmType: string): 'city' | 'area' | 'street' | 'other' {
  const cityTypes = ['city', 'town', 'village'];
  const areaTypes = ['administrative', 'county', 'district'];
  const streetTypes = ['street', 'road', 'avenue'];

  if (cityTypes.includes(osmType)) return 'city';
  if (areaTypes.includes(osmType)) return 'area';
  if (streetTypes.includes(osmType)) return 'street';
  return 'other';
}

/**
 * Fetch location suggestions from Nominatim with error handling
 */
async function fetchLocationSuggestions(
  query: string
): Promise<{ success: boolean; data: LocationSuggestion[]; error?: string }> {
  if (!query || query.length < 2) {
    return { success: true, data: [] };
  }

  try {
    // Measure API performance
    const { result, duration } = await SearchPerformanceMonitor.measureApiCall(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        try {
          const response = await fetch(
            `${NOMINATIM_API}/search?` +
            `format=json&` +
            `q=${encodeURIComponent(query)}&` +
            `limit=12&` + // Get more results for deduplication
            `countrycodes=in&` +
            `featuretype=city,town,village,administrative&` +
            `addressdetails=1`,
            {
              headers: {
                'User-Agent': 'ShareNest-Donation-Platform/2.0',
                'Accept': 'application/json',
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }
    );

    // Log slow queries
    SearchPerformanceMonitor.logSlowQuery(query, duration);

    // Transform results
    let suggestions: LocationSuggestion[] = result
      .map((item: any) => ({
        name: item.name,
        displayName: parseAddress(item.display_name), // Clean up address
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: getLocationType(item.type),
      }))
      .filter((item: LocationSuggestion) => {
        // Filter out invalid coordinates
        return !isNaN(item.lat) && !isNaN(item.lon);
      });

    // Deduplicate results (remove duplicates at same coordinates)
    suggestions = deduplicateResults(suggestions);

    // Rank results by relevance
    suggestions = rankResults(suggestions, query);

    // Limit to 8 results
    suggestions = suggestions.slice(0, 8);

    return {
      success: true,
      data: suggestions,
    };
  } catch (error) {
    console.error('❌ Location search error:', error);

    // Determine error type
    let errorMessage = 'Unable to search locations. Please try again.';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Search timed out. Please try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'Network error. Please check your connection.';
      }
    }

    return {
      success: false,
      data: [],
      error: errorMessage,
    };
  }
}

/**
 * Reverse geocode coordinates to get location name
 */
async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ success: boolean; data?: { name: string; displayName: string }; error?: string }> {
  try {
    const { result, duration } = await SearchPerformanceMonitor.measureApiCall(
      async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        try {
          const response = await fetch(
            `${NOMINATIM_API}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
            {
              headers: {
                'User-Agent': 'ShareNest-Donation-Platform/2.0',
              },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          return await response.json();
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      }
    );

    SearchPerformanceMonitor.logSlowQuery(`reverse-${lat}-${lon}`, duration);

    if (!result.address) {
      throw new Error('Invalid location');
    }

    return {
      success: true,
      data: {
        name:
          result.address?.city ||
          result.address?.town ||
          result.address?.village ||
          'Unknown Location',
        displayName: parseAddress(result.display_name),
      },
    };
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error);

    return {
      success: false,
      error: 'Unable to get location name. Please try again.',
    };
  }
}

/**
 * Validate location input
 */
const LocationQueryInput = z.object({
  query: z
    .string()
    .min(2, 'Search must be at least 2 characters')
    .max(100, 'Search is too long')
    .trim(),
});

const ReverseGeocodeInput = z.object({
  lat: z.number().min(-90).max(90, 'Invalid latitude'),
  lon: z.number().min(-180).max(180, 'Invalid longitude'),
});

/**
 * Export the production-grade search router
 */
export const searchRouter = createTRPCRouter({
  /**
   * Get location suggestions with full error handling
   */
  getLocationSuggestions: publicProcedure
    .input(LocationQueryInput)
    .query(async ({ input }) => {
      const result = await fetchLocationSuggestions(input.query);
      
      // Return in a format that's easy for the client to handle
      return {
        success: result.success,
        suggestions: result.data,
        error: result.error,
        count: result.data.length,
      };
    }),

  /**
   * Reverse geocode coordinates to get location name
   */
  reverseGeocode: publicProcedure
    .input(ReverseGeocodeInput)
    .query(async ({ input }) => {
      return await reverseGeocode(input.lat, input.lon);
    }),

  /**
   * Batch reverse geocode (useful for multiple locations)
   */
  batchReverseGeocode: publicProcedure
    .input(
      z.object({
        locations: z.array(
          z.object({
            lat: z.number(),
            lon: z.number(),
          })
        ),
      })
    )
    .query(async ({ input }) => {
      const results = await Promise.all(
        input.locations.map((loc) => reverseGeocode(loc.lat, loc.lon))
      );

      return {
        success: results.every((r) => r.success),
        data: results.map((r) => r.data),
        errors: results
          .map((r, i) => (r.error ? { index: i, error: r.error } : null))
          .filter(Boolean),
      };
    }),

  /**
   * Health check endpoint for API status
   */
  healthCheck: publicProcedure.query(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${NOMINATIM_API}/search?format=json&q=Delhi&limit=1`, {
        headers: {
          'User-Agent': 'ShareNest-Donation-Platform/2.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        status: response.ok ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }),
});
