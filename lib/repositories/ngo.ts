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
  categories: string[];
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

/** NGOs visible on explore / search (matches approval workflow). */
const DISCOVERABLE_NGO_SQL = `("isVerified" = TRUE OR "verificationStatus" = 'approved')`;

/** PostGIS point from geom column or lat/lng fallback. */
const NGO_LOCATION_POINT_SQL = `COALESCE(
  "location_geom"::geometry,
  CASE
    WHEN longitude IS NOT NULL AND latitude IS NOT NULL
    THEN ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    ELSE NULL
  END
)`;

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
  const conditions: string[] = [DISCOVERABLE_NGO_SQL];
  const params: (string | number)[] = [];
  let paramIdx = 1;

  // Geo radius — only for "near me" browsing, not when user is searching by name
  if (hasLocation && !hasSearch) {
    params.push(lng!, lat!, radiusKm * 1000); // PostGIS needs metres
    conditions.push(
      `${NGO_LOCATION_POINT_SQL} IS NOT NULL AND ST_DistanceSphere(
         ${NGO_LOCATION_POINT_SQL},
         ST_MakePoint($${paramIdx++}, $${paramIdx++})::geometry
       ) <= $${paramIdx++}`
    );
  }

  // Category filter
  if (hasCategory) {
    params.push(category!);
    conditions.push(`COALESCE("categories", ARRAY[]::text[]) && ARRAY[$${paramIdx++}]::text[]`);
  }

  // Free-text search across NGO name, bio, and categories.
  if (hasSearch) {
    params.push(`%${searchQuery!.trim()}%`);
    conditions.push(
      `(
        "organizationName" ILIKE $${paramIdx}
        OR "bio" ILIKE $${paramIdx}
        OR EXISTS (
          SELECT 1
          FROM unnest(COALESCE("categories", ARRAY[]::text[])) AS category_value
          WHERE category_value ILIKE $${paramIdx}
        )
      )`
    );
    paramIdx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // Distance expression (metres → km) — NULL when no user location
  const _distanceExpr = hasLocation
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
         ${NGO_LOCATION_POINT_SQL},
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
      categories,
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

/**
 * Name/typeahead suggestions for the explore search box.
 * No geo radius — typing "Pahal" should find NGOs anywhere in India.
 */
export async function findNGOSuggestions(searchQuery: string): Promise<NearbyNGO[]> {
  const q = searchQuery.trim();
  if (q.length < 1) return [];

  const pattern = `%${q}%`;
  const prefix = `${q}%`;

  // DISTINCT ON: one suggestion per org name (seed/import often creates duplicate rows)
  const sql = `
    SELECT DISTINCT ON (LOWER(TRIM("organizationName")))
      id,
      "organizationName",
      "missionArea",
      categories,
      bio,
      image,
      "isVerified",
      latitude,
      longitude,
      "locationName",
      NULL::float AS "distanceKm"
    FROM "NGO"
    WHERE ${DISCOVERABLE_NGO_SQL}
      AND (
        "organizationName" ILIKE $1
        OR "bio" ILIKE $1
        OR EXISTS (
          SELECT 1
          FROM unnest(COALESCE("categories", ARRAY[]::text[])) AS category_value
          WHERE category_value ILIKE $1
        )
      )
    ORDER BY
      LOWER(TRIM("organizationName")),
      CASE WHEN "organizationName" ILIKE $2 THEN 0 ELSE 1 END,
      "createdAt" DESC
    LIMIT 8
  `;

  const result = await query<NearbyNGO>(sql, [pattern, prefix]);
  return result.rows;
}
