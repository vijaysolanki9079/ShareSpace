/**
 * lib/repositories/ngo.ts
 *
 * Raw SQL is used here intentionally:
 *   - PostGIS operators (ST_DistanceSphere, ST_MakePoint) cannot be expressed via Prisma.
 *   - Nearby/geo queries are a core hot-path where raw SQL wins.
 *   - All params are fully parameterised; no string concatenation.
 */
import { query } from '@/lib/server-db';

export type NGOCategory =
  | 'Education'
  | 'Health'
  | 'Environment'
  | 'Poverty'
  | 'Food'
  | 'Other';

export type NearbyNGO = {
  id: string;
  organizationName: string;
  missionArea: string;
  bio: string | null;
  image: string | null;
  isVerified: boolean;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  distanceKm: number | null;  // null when user hasn't shared location
};

type FindNearbyNGOsOptions = {
  /** User latitude — if provided, results are ordered by distance */
  lat?: number | null;
  /** User longitude */
  lng?: number | null;
  /** Max distance in km (default 50 km) */
  radiusKm?: number;
  /** Category filter, 'All' skips filter */
  category?: string;
  /** Free-text against organizationName and bio */
  searchQuery?: string;
};

/**
 * Query NGOs from Supabase Postgres using PostGIS ST_DistanceSphere.
 * Raw SQL is isolated here; no ad-hoc SQL spreads into routers or UI.
 */
export async function findNearbyNGOs({
  lat,
  lng,
  radiusKm = 50,
  category,
  searchQuery,
}: FindNearbyNGOsOptions): Promise<NearbyNGO[]> {
  const hasLocation = lat != null && lng != null;
  const hasCategory = category && category !== 'All Causes';
  const hasSearch   = searchQuery && searchQuery.trim() !== '';

  // Build dynamic WHERE clauses with numbered params
  const conditions: string[] = ['"isVerified" = TRUE'];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  // Geo radius filter — only when user shares location
  if (hasLocation) {
    params.push(lng!, lat!, radiusKm * 1000); // PostGIS needs metres
    conditions.push(
      `"location_geom" IS NOT NULL AND ST_DistanceSphere(
         "location_geom"::geometry,
         ST_MakePoint($${paramIdx++}, $${paramIdx++})::geometry
       ) <= $${paramIdx++}`
    );
  }

  // Category filter
  if (hasCategory) {
    params.push(category!);
    conditions.push(`"missionArea" ILIKE '%' || $${paramIdx++} || '%'`);
  }

  // Free-text search — NGO name and bio only (not random shops, etc.)
  if (hasSearch) {
    params.push(`%${searchQuery!.trim()}%`);
    conditions.push(
      `("organizationName" ILIKE $${paramIdx} OR "bio" ILIKE $${paramIdx++})`
    );
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Distance expression (metres → km) — NULL when no user location
  const distanceExpr = hasLocation
    ? `ROUND((ST_DistanceSphere(
         "location_geom"::geometry,
         ST_MakePoint(${params.indexOf(lng!) + 1 /* lon param */}, ${params.indexOf(lat!) + 1 /* lat param */})::geometry
       ) / 1000.0)::numeric, 2)::float`
    : 'NULL';

  // Build distance expression cleanly using correct param indices
  const lonParamIdx = hasLocation ? 1 : null;
  const latParamIdx = hasLocation ? 2 : null;
  const distExpr = hasLocation
    ? `ROUND((ST_DistanceSphere(
         "location_geom"::geometry,
         ST_MakePoint($${lonParamIdx}, $${latParamIdx})::geometry
       ) / 1000.0)::numeric, 2)::float`
    : 'NULL::float';

  const orderBy = hasLocation
    ? `ORDER BY ${distExpr} ASC NULLS LAST`
    : 'ORDER BY "createdAt" DESC';

  const sql = `
    SELECT
      id,
      "organizationName",
      "missionArea",
      bio,
      image,
      "isVerified",
      latitude,
      longitude,
      "locationName",
      ${distExpr} AS "distanceKm"
    FROM "NGO"
    ${where}
    ${orderBy}
    LIMIT 100
  `;

  const result = await query<NearbyNGO>(sql, params);
  return result.rows;
}
