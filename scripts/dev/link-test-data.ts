import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const testUser = await prisma.user.findUnique({ where: { email: 'testuser@sharespace.com' } });
  const testNGO = await prisma.nGO.findUnique({ where: { email: 'testngo@sharespace.com' } });

  if (!testUser || !testNGO) {
    console.error('Test accounts not found.');
    return;
  }

  console.log('Linking 5 existing ItemRequests to testuser@sharespace.com...');
  const randomReqs = await prisma.itemRequest.findMany({ take: 5 });
  for (const r of randomReqs) {
    await prisma.itemRequest.update({
      where: { id: r.id },
      data: { requesterId: testUser.id }
    });
  }

  console.log('Linking 5 existing ItemResponses to testuser@sharespace.com (as donor)...');
  const randomResps = await prisma.itemResponse.findMany({ take: 5 });
  for (const r of randomResps) {
    await prisma.itemResponse.update({
      where: { id: r.id },
      data: { donorId: testUser.id }
    });
  }

  console.log('Linking 5 existing ItemRequests to testngo@sharespace.com...');
  const randomNGOReqs = await prisma.itemRequest.findMany({ skip: 5, take: 5 });
  for (const r of randomNGOReqs) {
    await prisma.itemRequest.update({
      where: { id: r.id },
      data: { ngoId: testNGO.id }
    });
  }

  console.log('Successfully linked dummy data to test accounts!');
}

main().catch(console.error).finally(() => { prisma.$disconnect(); pool.end(); });
