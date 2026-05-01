/**
 * prisma/seed_jalandhar.mjs
 * Adds 3 realistic NGOs in Jalandhar, Punjab.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcryptjs.hash('ShareSpace@2025', 10);
  
  const jalandharNGOs = [
    {
      organizationName: 'Pahal Youth Welfare Society',
      email: 'pahal@jalandhar.org.in',
      registrationNumber: 'IND/NGO/PB/2012/0882',
      missionArea: 'Education',
      categories: ['Education', 'Environment'],
      bio: 'Pahal is a leading NGO in Jalandhar dedicated to literacy, environmental conservation, and youth empowerment. We run several vocational training centers for rural women and organize massive tree plantation drives across the Doaba region.',
      latitude: 31.3260,
      longitude: 75.5762,
      locationName: 'Jalandhar, Punjab',
    },
    {
      organizationName: 'Doaba Health & Relief Trust',
      email: 'care@doaba.org.in',
      registrationNumber: 'IND/NGO/PB/2015/0941',
      missionArea: 'Health',
      categories: ['Health', 'Poverty'],
      bio: 'The Doaba Health Trust provides free dialysis and medical checkups to underprivileged residents of Jalandhar and surrounding villages. We operate mobile clinics that travel to remote areas every weekend.',
      latitude: 31.3400,
      longitude: 75.5800,
      locationName: 'Model Town, Jalandhar, Punjab',
    },
    {
      organizationName: 'Punjab Environmental Action Group',
      email: 'green@punjabenv.org',
      registrationNumber: 'IND/NGO/PB/2018/0773',
      missionArea: 'Environment',
      categories: ['Environment'],
      bio: 'Focused on reducing water pollution in the Kali Bein and increasing green cover in Jalandhar city. We work with local schools to create awareness about plastic-free lifestyles and waste segregation.',
      latitude: 31.3100,
      longitude: 75.5600,
      locationName: 'Civil Lines, Jalandhar, Punjab',
    }
  ];

  console.log('🌱  Adding Jalandhar NGOs...');

  for (const data of jalandharNGOs) {
    const existing = await prisma.nGO.findUnique({ where: { email: data.email } });
    if (existing) {
      console.log(`  ⏭️  Skipping existing: ${data.organizationName}`);
      continue;
    }

    const created = await prisma.nGO.create({
      data: {
        ...data,
        password,
        isVerified: true,
        verificationStatus: 'approved',
        image: 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?w=800'
      }
    });

    // Update PostGIS geometry column immediately
    await pool.query(
      'UPDATE "NGO" SET "location_geom" = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3',
      [data.longitude, data.latitude, created.id]
    );

    console.log(`  ✅  Added: ${data.organizationName}`);
  }

  console.log('\n🎉  Jalandhar NGOs seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
