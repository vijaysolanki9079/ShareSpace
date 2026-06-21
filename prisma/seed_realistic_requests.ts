import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL in .env.local');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'password123';
const DEMO_USER_DOMAIN = 'sharespace-demo.local';
const LEGACY_FAKE_START = new Date('2026-05-01T07:52:19.000Z');
const LEGACY_FAKE_END = new Date('2026-05-01T07:52:20.000Z');

const demoUsers = [
  ['aarav.mehta', 'Aarav Mehta', 'Jalandhar, Punjab'],
  ['simran.kaur', 'Simran Kaur', 'Ludhiana, Punjab'],
  ['neha.sharma', 'Neha Sharma', 'Noida, Uttar Pradesh'],
  ['rohan.bansal', 'Rohan Bansal', 'Gurugram, Haryana'],
  ['priya.malhotra', 'Priya Malhotra', 'New Delhi, Delhi'],
  ['kabir.singh', 'Kabir Singh', 'Jaipur, Rajasthan'],
  ['ananya.rao', 'Ananya Rao', 'Mumbai, Maharashtra'],
  ['harpreet.gill', 'Harpreet Gill', 'Amritsar, Punjab'],
  ['meera.sethi', 'Meera Sethi', 'Chandigarh'],
  ['dev.arora', 'Dev Arora', 'Faridabad, Haryana'],
  ['isha.kapoor', 'Isha Kapoor', 'Ghaziabad, Uttar Pradesh'],
  ['vikram.ahuja', 'Vikram Ahuja', 'Mohali, Punjab'],
] as const;

const locations = [
  { name: 'Model Town, Jalandhar, Punjab', latitude: 31.326, longitude: 75.5762 },
  { name: 'Civil Lines, Jalandhar, Punjab', latitude: 31.3182, longitude: 75.5794 },
  { name: 'Ludhiana, Punjab', latitude: 30.901, longitude: 75.8573 },
  { name: 'Amritsar, Punjab', latitude: 31.634, longitude: 74.8723 },
  { name: 'Mohali, Punjab', latitude: 30.7046, longitude: 76.7179 },
  { name: 'Sector 62, Noida, Uttar Pradesh', latitude: 28.6268, longitude: 77.3649 },
  { name: 'Sector 18, Noida, Uttar Pradesh', latitude: 28.5706, longitude: 77.3261 },
  { name: 'Cyber City, Gurugram, Haryana', latitude: 28.4949, longitude: 77.0888 },
  { name: 'Saket, New Delhi, Delhi', latitude: 28.5245, longitude: 77.2066 },
  { name: 'Dwarka, New Delhi, Delhi', latitude: 28.5921, longitude: 77.046 },
  { name: 'Vaishali Nagar, Jaipur, Rajasthan', latitude: 26.9124, longitude: 75.7439 },
  { name: 'Malviya Nagar, Jaipur, Rajasthan', latitude: 26.8543, longitude: 75.8077 },
  { name: 'Andheri West, Mumbai, Maharashtra', latitude: 19.1364, longitude: 72.8296 },
  { name: 'Dadar, Mumbai, Maharashtra', latitude: 19.0178, longitude: 72.8478 },
] as const;

const imageByType = {
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=900',
  tablet: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=900',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=900',
  books: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=900',
  notebooks: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=900',
  schoolBag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=900',
  clothes: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=900',
  winterClothes: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=900',
  shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900',
  blanket: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=900',
  studyTable: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=900',
  chair: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&q=80&w=900',
  bed: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=900',
  sofa: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=900',
  utensils: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&q=80&w=900',
  cooker: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&q=80&w=900',
  ration: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=900',
  toys: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=900',
  football: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=900',
  cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=900',
  toolbox: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=900',
  sewing: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=900',
  wheelchair: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=900',
  firstAid: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=900',
};

const requestTemplates = [
  ['Used Laptop for Online Classes', 'A working laptop is needed for a college student attending online lectures and submitting assignments.', 'electronics', imageByType.laptop],
  ['Basic Tablet for School Lessons', 'A simple tablet will help a class 6 student watch lessons and complete digital homework.', 'electronics', imageByType.tablet],
  ['Android Phone for Job Search', 'Need a working smartphone so a young job seeker can apply for openings and attend interview calls.', 'electronics', imageByType.phone],
  ['NCERT Books for Class 10', 'Looking for class 10 NCERT books in readable condition for board exam preparation.', 'books', imageByType.books],
  ['Story Books for Reading Corner', 'Children in a community reading corner need age-friendly story books in Hindi or English.', 'books', imageByType.books],
  ['Notebooks and Stationery Set', 'Need notebooks, pencils, erasers, and geometry boxes for students starting the new term.', 'books', imageByType.notebooks],
  ['School Bag for Class 8 Student', 'A sturdy school bag is needed for a student who currently carries books in a plastic packet.', 'books', imageByType.schoolBag],
  ['Winter Jackets for Children', 'Warm jackets or sweaters are needed for children in a low-income neighbourhood.', 'clothes', imageByType.winterClothes],
  ['Clean Shirts and Trousers', 'Need clean daily-wear clothes for men who are joining a vocational training batch.', 'clothes', imageByType.clothes],
  ['Women Clothes for Shelter Home', 'Cotton suits, dupattas, and everyday clothing are needed for residents of a shelter home.', 'clothes', imageByType.clothes],
  ['Sports Shoes for Teenager', 'A pair of usable sports shoes is needed for a teenager selected for school athletics practice.', 'clothes', imageByType.shoes],
  ['Blankets for Night Shelter', 'Clean blankets are needed for people sleeping at a temporary winter night shelter.', 'shelter', imageByType.blanket],
  ['Single Bed Frame for Family', 'A small bed frame is needed for a family moving out of temporary accommodation.', 'furniture', imageByType.bed],
  ['Study Table for Student', 'Need a compact study table for a student preparing for entrance exams at home.', 'furniture', imageByType.studyTable],
  ['Office Chair for Training Room', 'A functional chair is needed for a small digital literacy training room.', 'furniture', imageByType.chair],
  ['Two-Seater Sofa for NGO Office', 'A clean two-seater sofa will help set up a waiting area for visitors and beneficiaries.', 'furniture', imageByType.sofa],
  ['Steel Plates and Bowls', 'Steel plates and bowls are needed for a weekly community meal programme.', 'kitchen', imageByType.utensils],
  ['Pressure Cooker for Community Kitchen', 'A working pressure cooker is needed for preparing dal and rice at a community kitchen.', 'kitchen', imageByType.cooker],
  ['Monthly Ration Kit', 'Need rice, dal, atta, oil, and basic groceries for a family facing a short-term emergency.', 'food', imageByType.ration],
  ['Soft Toys for Child Care Centre', 'Clean soft toys are needed for children at a daycare and counselling centre.', 'toys', imageByType.toys],
  ['Board Games for After-School Club', 'Need chess, carrom, ludo, or puzzle games for an after-school learning club.', 'toys', imageByType.toys],
  ['Football for Community Ground', 'A football is needed for evening sports sessions with neighbourhood children.', 'sports', imageByType.football],
  ['Cricket Bat and Ball Set', 'A basic cricket set is needed for weekend sports activity with local students.', 'sports', imageByType.cricket],
  ['Tool Kit for Repair Workshop', 'Need a basic tool kit with screwdrivers, pliers, hammer, and measuring tape for repair training.', 'tools', imageByType.toolbox],
  ['Sewing Machine for Skill Training', 'A working sewing machine is needed for women learning tailoring and alterations.', 'tools', imageByType.sewing],
  ['Wheelchair for Elderly Person', 'A foldable wheelchair is needed for an elderly person who has limited mobility.', 'health', imageByType.wheelchair],
  ['First Aid Supplies for Camp', 'Bandages, antiseptic, cotton, ORS, and basic first-aid material are needed for a health camp.', 'health', imageByType.firstAid],
] as const;

function normalizeCategory(name: string) {
  const lower = name.toLowerCase();
  if (lower === 'food') return 'Food';
  if (lower === 'health') return 'Health';
  if (lower === 'shelter') return 'Shelter';
  return lower;
}

async function main() {
  const password = await bcryptjs.hash(DEMO_PASSWORD, 10);
  const categories = await prisma.itemCategory.findMany();
  const categoryByName = new Map(categories.map((category) => [category.name.toLowerCase(), category]));

  const requiredCategories = [...new Set(requestTemplates.map((template) => normalizeCategory(template[2])))];
  for (const categoryName of requiredCategories) {
    if (!categoryByName.has(categoryName.toLowerCase())) {
      const category = await prisma.itemCategory.create({
        data: {
          name: categoryName,
          description: `${categoryName} donation requests`,
        },
      });
      categoryByName.set(category.name.toLowerCase(), category);
    }
  }

  const users = [];
  for (const [slug, fullName, location] of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: `${slug}@${DEMO_USER_DOMAIN}` },
      update: { fullName, location },
      create: {
        email: `${slug}@${DEMO_USER_DOMAIN}`,
        password,
        fullName,
        location,
        bio: 'ShareSpace demo requester',
      },
    });
    users.push(user);
  }

  const demoEmails = demoUsers.map(([slug]) => `${slug}@${DEMO_USER_DOMAIN}`);
  const demoRequesters = await prisma.user.findMany({
    where: { email: { in: demoEmails } },
    select: { id: true },
  });

  const deletedDemo = await prisma.itemRequest.deleteMany({
    where: {
      requesterId: { in: demoRequesters.map((user) => user.id) },
    },
  });

  const deletedLegacy = await prisma.itemRequest.deleteMany({
    where: {
      createdAt: {
        gte: LEGACY_FAKE_START,
        lt: LEGACY_FAKE_END,
      },
    },
  });

  const verifiedNgos = await prisma.nGO.findMany({
    where: { verificationStatus: 'approved' },
    select: { id: true },
    take: 20,
  });

  const createdRequests = [];
  const totalRequests = 64;
  for (let index = 0; index < totalRequests; index++) {
    const template = requestTemplates[index % requestTemplates.length];
    const cycle = Math.floor(index / requestTemplates.length);
    const location = locations[index % locations.length];
    const requester = users[index % users.length];
    const categoryName = normalizeCategory(template[2]);
    const category = categoryByName.get(categoryName.toLowerCase());

    if (!category) {
      throw new Error(`Missing category: ${categoryName}`);
    }

    const createdAt = new Date(Date.now() - index * 60 * 60 * 1000);
    const title = cycle === 0 ? template[0] : `${template[0]} - ${location.name.split(',')[0]}`;

    createdRequests.push(
      await prisma.itemRequest.create({
        data: {
          requesterId: requester.id,
          title,
          description: template[1],
          categoryId: category.id,
          images: [template[3]],
          latitude: location.latitude,
          longitude: location.longitude,
          locationName: location.name,
          radius: 8000 + (index % 5) * 3000,
          status: 'open',
          ngoId: verifiedNgos.length > 0 && index % 5 === 0 ? verifiedNgos[index % verifiedNgos.length].id : null,
          createdAt,
          updatedAt: createdAt,
        },
      })
    );
  }

  await pool.query(
    'UPDATE "ItemRequest" SET "location_geom" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE longitude IS NOT NULL AND latitude IS NOT NULL;'
  );

  console.log(
    JSON.stringify(
      {
        deletedOldDemoRequests: deletedDemo.count,
        deletedLegacyFakerRequests: deletedLegacy.count,
        createdRealisticRequests: createdRequests.length,
        totalItemRequests: await prisma.itemRequest.count(),
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
