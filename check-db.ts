import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.count();
  const ngos = await prisma.nGO.count();
  const itemReqs = await prisma.itemRequest.count();
  const itemResps = await prisma.itemResponse.count();
  const messages = await prisma.message.count();

  console.log('✅ DATABASE CONNECTION SUCCESSFUL');
  console.log('-----------------------------------');
  console.log(`Users: ${users}`);
  console.log(`NGOs: ${ngos}`);
  console.log(`Item Requests: ${itemReqs}`);
  console.log(`Item Responses: ${itemResps}`);
  console.log(`Messages: ${messages}`);
  
  // Let's also check if we can fetch Nearby NGOs using the raw SQL query
  const res = await pool.query(`SELECT COUNT(*) FROM "NGO" WHERE "location_geom" IS NOT NULL`);
  console.log(`NGOs with valid Map Coordinates (PostGIS): ${res.rows[0].count}`);
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
