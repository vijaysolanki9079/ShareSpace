import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  console.log('Enabling PostGIS...');
  await pool.query('CREATE EXTENSION IF NOT EXISTS postgis;');

  console.log('Adding location_geom to NGO...');
  await pool.query('ALTER TABLE "NGO" ADD COLUMN IF NOT EXISTS "location_geom" geometry(Point, 4326);');
  await pool.query('UPDATE "NGO" SET "location_geom" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE longitude IS NOT NULL AND latitude IS NOT NULL;');

  console.log('Adding location_geom to ItemRequest...');
  await pool.query('ALTER TABLE "ItemRequest" ADD COLUMN IF NOT EXISTS "location_geom" geometry(Point, 4326);');
  await pool.query('UPDATE "ItemRequest" SET "location_geom" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE longitude IS NOT NULL AND latitude IS NOT NULL;');

  console.log('Done.');
  await pool.end();
}

main().catch(console.error);
