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
  const passwordHash = await bcryptjs.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'testuser@sharespace.com' },
    update: { password: passwordHash },
    create: {
      email: 'testuser@sharespace.com',
      password: passwordHash,
      fullName: 'Test User',
      location: 'Delhi',
    }
  });

  await prisma.nGO.upsert({
    where: { email: 'testngo@sharespace.com' },
    update: { password: passwordHash },
    create: {
      email: 'testngo@sharespace.com',
      password: passwordHash,
      organizationName: 'Test NGO',
      registrationNumber: 'TEST1234',
      missionArea: 'Education',
      isVerified: true,
      verificationStatus: 'approved',
      latitude: 28.6139,
      longitude: 77.2090,
    }
  });
  console.log('Test accounts created successfully!');
  console.log('User: testuser@sharespace.com / password123');
  console.log('NGO: testngo@sharespace.com / password123');
}

main().finally(() => { prisma.$disconnect(); pool.end(); });
