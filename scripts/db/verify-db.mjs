
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? process.env.DIRECT_URL,
  ssl: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' ? { rejectUnauthorized: true } : false,
});

async function verify() {
  try {
    const extensions = await pool.query("SELECT extname FROM pg_extension WHERE extname = 'postgis'");
    console.log('Extensions:', extensions.rows);

    const columns = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'NGO' AND column_name = 'location_geom'
    `);
    console.log('NGO location_geom column:', columns.rows);
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await pool.end();
    process.exit();
  }
}

verify();
