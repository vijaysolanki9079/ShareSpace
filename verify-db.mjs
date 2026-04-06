
import { query } from './lib/server-db.js';

async function verify() {
  try {
    const extensions = await query("SELECT extname FROM pg_extension WHERE extname = 'postgis'");
    console.log('Extensions:', extensions.rows);

    const columns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'NGO' AND column_name = 'location_geom'
    `);
    console.log('NGO location_geom column:', columns.rows);
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    process.exit();
  }
}

verify();
