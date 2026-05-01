import { appRouter } from './server/routers/_app';
import { prisma } from './lib/prisma';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const caller = appRouter.createCaller({
    headers: new Headers(),
    prisma,
    session: null,
  });
  
  console.log('Testing ngo.search...');
  try {
    const ngos = await caller.ngo.search({ lat: 28.6139, lng: 77.2090, radiusKm: 50, category: 'All Causes', searchQuery: '' });
    console.log(`Found ${ngos.length} nearby NGOs`);
  } catch (e) {
    console.error('Error in ngo.search:', e);
  }

  const u = await prisma.user.findFirst();
  if (u) {
    console.log(`Testing item.getMyRequests for user ${u.email}...`);
    try {
      const reqs = await caller.item.getMyRequests({ userId: u.id });
      console.log(`Found ${reqs.length} requests for user`);
    } catch (e) {
      console.error('Error in item.getMyRequests:', e);
    }
  }
}

main().finally(() => prisma.$disconnect());
