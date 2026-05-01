import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { faker } from '@faker-js/faker';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcryptjs.hash('password123', 10);
  
  console.log('Seeding Categories...');
  const categoriesList = ['Food', 'Clothes', 'Education', 'Health', 'Shelter', 'Toys', 'Electronics', 'Furniture'];
  for (const catName of categoriesList) {
    await prisma.itemCategory.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName, description: faker.lorem.sentence() }
    });
  }
  const allCategories = await prisma.itemCategory.findMany();

  console.log('Seeding 50 Users...');
  const users = [];
  for (let i = 0; i < 50; i++) {
    users.push({
      email: faker.internet.email(),
      password: passwordHash,
      fullName: faker.person.fullName(),
      bio: faker.person.bio(),
      location: faker.location.city(),
    });
  }
  const createdUsers = await Promise.all(users.map(u => prisma.user.create({ data: u })));

  console.log('Seeding 100 NGOs...');
  const ngos = [];
  for (let i = 0; i < 100; i++) {
    const selectedCategories = faker.helpers.arrayElements(categoriesList, { min: 1, max: 3 });
    ngos.push({
      email: faker.internet.email(),
      password: passwordHash,
      organizationName: faker.company.name() + ' NGO',
      registrationNumber: faker.string.alphanumeric(10).toUpperCase(),
      missionArea: selectedCategories[0],
      categories: selectedCategories,
      isVerified: faker.datatype.boolean(),
      verificationStatus: 'approved',
      bio: faker.company.catchPhrase(),
      latitude: faker.location.latitude({ max: 29, min: 28 }), // Delhi NCR
      longitude: faker.location.longitude({ max: 78, min: 76 }),
      locationName: faker.location.city(),
    });
  }
  const createdNGOs = await Promise.all(ngos.map(n => prisma.nGO.create({ data: n })));
  
  console.log('Seeding 150 ItemRequests (The new P2P system)...');
  const itemRequests = [];
  for (let i = 0; i < 150; i++) {
    const requester = faker.helpers.arrayElement(createdUsers as any[]);
    const category = faker.helpers.arrayElement(allCategories as any[]);
    const isNgoLinked = faker.datatype.boolean({ probability: 0.3 });
    
    itemRequests.push({
      requesterId: requester.id,
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      categoryId: category.id,
      images: [faker.image.urlLoremFlickr({ category: category.name.toLowerCase() })],
      latitude: faker.location.latitude({ max: 29, min: 28 }),
      longitude: faker.location.longitude({ max: 78, min: 76 }),
      locationName: faker.location.city(),
      radius: faker.number.int({ min: 1000, max: 20000 }),
      status: faker.helpers.arrayElement(['open', 'open', 'fulfilled', 'closed']), // 50% open
      ngoId: isNgoLinked ? faker.helpers.arrayElement(createdNGOs as any[]).id : null,
    });
  }
  const createdItemRequests = await Promise.all(itemRequests.map(r => prisma.itemRequest.create({ data: r })));

  console.log('Seeding 200 ItemResponses (Donors responding to requests)...');
  for (let i = 0; i < 200; i++) {
    const itemReq = faker.helpers.arrayElement(createdItemRequests as any[]);
    const donor = faker.helpers.arrayElement(createdUsers as any[]);
    
    // Avoid user responding to own request
    if (itemReq.requesterId === donor.id) continue;

    // A response creates a conversation
    const conversation = await prisma.conversation.create({
      data: {
        user1Id: itemReq.requesterId,
        user2Id: donor.id,
        itemRequestId: itemReq.id,
      }
    });

    await prisma.itemResponse.upsert({
      where: {
        donorId_itemRequestId: {
          donorId: donor.id,
          itemRequestId: itemReq.id,
        }
      },
      update: {},
      create: {
        donorId: donor.id,
        itemRequestId: itemReq.id,
        conversationId: conversation.id,
        status: faker.helpers.arrayElement(['interested', 'fulfilled']),
        message: faker.lorem.sentence(),
      }
    });

    // Add some messages
    for (let j = 0; j < 3; j++) {
      const isDonor = j % 2 === 0;
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: isDonor ? donor.id : itemReq.requesterId,
          senderType: 'USER',
          content: faker.lorem.sentence(), 
        }
      });
    }
  }

  // Update PostGIS columns immediately
  console.log('Syncing PostGIS geometry columns...');
  await pool.query('UPDATE "NGO" SET "location_geom" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE longitude IS NOT NULL AND latitude IS NOT NULL;');
  await pool.query('UPDATE "ItemRequest" SET "location_geom" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE longitude IS NOT NULL AND latitude IS NOT NULL;');

  console.log('Seed completed successfully!');
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
