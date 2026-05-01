/**
 * prisma/seed_final.mjs
 * 
 * Professional, high-density seed for ShareSpace.
 * Now with UNIQUE, category-specific images for every NGO.
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

const CITIES = [
  { name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
  { name: 'Delhi, NCR', lat: 28.6139, lng: 77.2090 },
  { name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
  { name: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { name: 'Kolkata, West Bengal', lat: 22.5726, lng: 88.3639 },
  { name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Jaipur, Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Indore, Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { name: 'Bhopal, Madhya Pradesh', lat: 23.2599, lng: 77.4126 },
  { name: 'Patna, Bihar', lat: 25.5941, lng: 85.1376 },
  { name: 'Bhubaneswar, Odisha', lat: 20.2961, lng: 85.8245 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Kochi, Kerala', lat: 9.9312, lng: 76.2673 },
  { name: 'Guwahati, Assam', lat: 26.1445, lng: 91.7362 },
  { name: 'Dehradun, Uttarakhand', lat: 30.3165, lng: 78.0322 },
  { name: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 },
  { name: 'Nagpur, Maharashtra', lat: 21.1458, lng: 79.0882 },
  { name: 'Visakhapatnam, Andhra Pradesh', lat: 17.6868, lng: 83.2185 },
  { name: 'Varanasi, Uttar Pradesh', lat: 25.3176, lng: 82.9739 },
  { name: 'Amritsar, Punjab', lat: 31.6340, lng: 74.8723 },
  { name: 'Coimbatore, Tamil Nadu', lat: 11.0168, lng: 76.9558 },
  { name: 'Ranchi, Jharkhand', lat: 23.3441, lng: 85.3096 },
  { name: 'Jalandhar, Punjab', lat: 31.3260, lng: 75.5762 }
];

const CAUSE_IMAGES = {
  'Education': [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655'
  ],
  'Health': [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7'
  ],
  'Environment': [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09',
    'https://images.unsplash.com/photo-1416169607655-0c2b3ce2e1cc',
    'https://images.unsplash.com/photo-1501854140801-515011ce7d78',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e'
  ],
  'Food': [
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd',
    'https://images.unsplash.com/photo-1591336369234-a2123512903e',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1'
  ],
  'Poverty': [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb8',
    'https://images.unsplash.com/photo-1489980557514-251d61e3eeb6'
  ]
};

const CAUSES = [
  { area: 'Education', prefixes: ['Gyan', 'Vidya', 'Shiksha', 'Little'], suffixes: ['Foundation', 'Academy', 'Society', 'Learning Center'], bioTemplate: 'Dedicated to providing quality education and vocational training to children in urban slums.' },
  { area: 'Health', prefixes: ['Aarogya', 'Swasthya', 'Cure', 'Healing'], suffixes: ['Health Trust', 'Hospital', 'Welfare Society', 'Medical Foundation'], bioTemplate: 'Providing free diagnostic services, maternal care, and immunization drives for marginalized populations.' },
  { area: 'Environment', prefixes: ['Green', 'Eco', 'Prakriti', 'Earth'], suffixes: ['Conservation', 'Society', 'Foundation', 'Project'], bioTemplate: 'Focused on urban reforestation, waste management, and river cleanup.' },
  { area: 'Food', prefixes: ['Anna', 'Roti', 'Hunger', 'Bhojan'], suffixes: ['Bank', 'Seva', 'Mission', 'Charity'], bioTemplate: 'Committed to ending hunger by redistributing surplus food and operating community kitchens.' },
  { area: 'Poverty', prefixes: ['Sahara', 'Udaan', 'Naya', 'Hope'], suffixes: ['Welfare', 'Trust', 'Foundation', 'Support Group'], bioTemplate: 'Providing livelihood support and housing assistance to families below the poverty line.' }
];

async function main() {
  console.log('🚀  Wiping all NGO records...');
  await prisma.nGO.deleteMany({});
  
  const password = await bcryptjs.hash('ShareSpace@2025', 10);
  const ngosToCreate = [];

  for (let i = 0; i < 70; i++) {
    const city = CITIES[i % CITIES.length];
    const cause = CAUSES[i % CAUSES.length];
    const prefix = cause.prefixes[Math.floor(i / CAUSES.length) % cause.prefixes.length];
    const suffix = cause.suffixes[i % cause.suffixes.length];
    
    const name = `${prefix} ${suffix} ${i > 20 ? (i % 3 === 0 ? city.name.split(',')[0] : '') : ''}`.trim();
    const email = `${name.toLowerCase().replace(/[^a-z]/g, '')}${i}@org.in`;
    const regNum = `IND/NGO/${city.name.substring(0, 2).toUpperCase()}/${2010 + (i % 14)}/${1000 + i}`;

    // Get a random image from the category list
    const images = CAUSE_IMAGES[cause.area] || CAUSE_IMAGES['Education'];
    const imageUrl = `${images[i % images.length]}?w=800&auto=format&fit=crop&q=60`;

    ngosToCreate.push({
      organizationName: name,
      email,
      password,
      registrationNumber: regNum,
      missionArea: cause.area,
      categories: [cause.area],
      bio: `${name} - ${cause.bioTemplate}`,
      latitude: city.lat + (Math.random() - 0.5) * 0.05,
      longitude: city.lng + (Math.random() - 0.5) * 0.05,
      locationName: city.name,
      isVerified: true,
      verificationStatus: 'approved',
      image: imageUrl
    });
  }

  console.log(`🌱  Seeding 70 NGOs with UNIQUE images...`);

  for (const data of ngosToCreate) {
    const created = await prisma.nGO.create({ data });
    // Update PostGIS
    await pool.query(
      'UPDATE "NGO" SET "location_geom" = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3',
      [data.longitude, data.latitude, created.id]
    );
  }

  console.log('\n✨  Seed Complete with varied images!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); await pool.end(); });
