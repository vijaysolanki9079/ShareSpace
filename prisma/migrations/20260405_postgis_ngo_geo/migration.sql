-- Enable PostGIS extension (Supabase supports this natively)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add plain decimal coordinate columns for Leaflet rendering
ALTER TABLE "NGO" ADD COLUMN IF NOT EXISTS "latitude"     DOUBLE PRECISION;
ALTER TABLE "NGO" ADD COLUMN IF NOT EXISTS "longitude"    DOUBLE PRECISION;
ALTER TABLE "NGO" ADD COLUMN IF NOT EXISTS "locationName" TEXT;

-- Add the PostGIS geography column
ALTER TABLE "NGO"
  ADD COLUMN IF NOT EXISTS "location_geom" geography(Point, 4326);

-- Spatial index for efficient nearest-neighbor queries
CREATE INDEX IF NOT EXISTS "ngo_location_geom_idx"
  ON "NGO" USING GIST ("location_geom");

-- Auto-sync location_geom from latitude/longitude when they are set
CREATE OR REPLACE FUNCTION sync_ngo_location_geom()
  RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location_geom = ST_SetSRID(
      ST_MakePoint(NEW.longitude, NEW.latitude),  -- note: PostGIS is (lon, lat)
      4326
    )::geography;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_ngo_location_geom ON "NGO";
CREATE TRIGGER trg_sync_ngo_location_geom
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON "NGO"
  FOR EACH ROW
  EXECUTE FUNCTION sync_ngo_location_geom();
