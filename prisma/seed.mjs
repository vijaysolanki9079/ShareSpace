/**
 * prisma/seed.mjs
 *
 * Realistic seed data for ShareSpace — suitable for portfolio demos & interviews.
 * All NGOs are fictional but modelled on real Indian charitable organisations.
 * Run with: node prisma/seed.mjs  (or via `npx prisma db seed`)
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌  Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const pool   = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter });


// ─── Realistic NGO Data ────────────────────────────────────────────────────────
const NGO_SEED_DATA = [
  {
    organizationName: 'Shiksha Setu Foundation',
    registrationNumber: 'MHA/NGO/DL/2016/0047',
    email: 'connect@shikshasetu.org',
    password: 'ShareSpace@2025',
    website: 'https://shikshasetu.org',
    missionArea: 'Education',
    categories: ['Education', 'Poverty'],
    bio: 'Shiksha Setu Foundation bridges the education gap for underprivileged children across Delhi-NCR by running community learning centres, distributing free study material, and training local volunteers as teachers. Since 2016, we have impacted over 18,000 students across 42 centres.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 28.6304,
    longitude: 77.2177,
    locationName: 'New Delhi, Delhi',
  },
  {
    organizationName: 'Aarogya Bharati Health Trust',
    registrationNumber: 'MHA/NGO/MH/2014/0189',
    email: 'info@aarogyabharati.org',
    password: 'ShareSpace@2025',
    website: 'https://aarogyabharati.org',
    missionArea: 'Health',
    categories: ['Health'],
    bio: 'Aarogya Bharati runs free mobile medical camps across Mumbai\'s slum communities, providing primary healthcare, maternal care, and mental health counselling. Our network of 200+ volunteer doctors has served more than 85,000 patients since inception.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 19.0556,
    longitude: 72.8367,
    locationName: 'Dharavi, Mumbai, Maharashtra',
  },
  {
    organizationName: 'Hariyali Prayas Society',
    registrationNumber: 'MHA/NGO/KA/2018/0312',
    email: 'green@hariyaliprayas.org',
    password: 'ShareSpace@2025',
    website: 'https://hariyaliprayas.org',
    missionArea: 'Environment',
    categories: ['Environment'],
    bio: 'Hariyali Prayas works to restore urban green cover in Bengaluru through community plantation drives, rooftop garden programmes, and lake rejuvenation projects. We have planted over 1.2 lakh trees and restored 6 urban lakes in partnership with the BBMP.',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 12.9716,
    longitude: 77.5946,
    locationName: 'Bengaluru, Karnataka',
  },
  {
    organizationName: 'Anna Daan Charitable Society',
    registrationNumber: 'MHA/NGO/TN/2013/0078',
    email: 'food@annadaan.org',
    password: 'ShareSpace@2025',
    website: 'https://annadaan.org',
    missionArea: 'Food',
    categories: ['Food', 'Poverty'],
    bio: 'Anna Daan collects surplus food from hotels, wedding venues, and corporate cafeterias across Chennai and redistributes it to shelters, orphanages, and daily-wage workers — ensuring zero wastage. Our volunteer fleet delivers over 4,000 meals daily across the city.',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 13.0827,
    longitude: 80.2707,
    locationName: 'Chennai, Tamil Nadu',
  },
  {
    organizationName: 'Naya Ghar Housing Foundation',
    registrationNumber: 'MHA/NGO/TS/2017/0204',
    email: 'support@nayaghar.org',
    password: 'ShareSpace@2025',
    website: 'https://nayaghar.org',
    missionArea: 'Poverty',
    categories: ['Poverty', 'Education'],
    bio: 'Naya Ghar Foundation constructs low-cost, earthquake-resistant homes for families living in temporary shelters across Hyderabad\'s peri-urban areas. We also operate skill-training centres that equip residents with vocational skills to achieve economic self-sufficiency.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 17.3617,
    longitude: 78.4747,
    locationName: 'Hyderabad, Telangana',
  },
  {
    organizationName: 'Bal Vikas Mandal Pune',
    registrationNumber: 'MHA/NGO/MH/2015/0533',
    email: 'hello@balvikasmandal.org',
    password: 'ShareSpace@2025',
    website: 'https://balvikasmandal.org',
    missionArea: 'Education',
    categories: ['Education', 'Health'],
    bio: 'Bal Vikas Mandal operates after-school tutoring centres and nutrition programmes for children aged 5–14 in Pune\'s underserved wards. Our holistic model pairs academic support with health check-ups and psychological well-being sessions, reaching 6,500 children annually.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 18.5204,
    longitude: 73.8567,
    locationName: 'Pune, Maharashtra',
  },
  {
    organizationName: 'Swasthya Setu Kolkata',
    registrationNumber: 'MHA/NGO/WB/2012/0101',
    email: 'care@swasthyasetu.org',
    password: 'ShareSpace@2025',
    website: 'https://swasthyasetu.org',
    missionArea: 'Health',
    categories: ['Health', 'Poverty'],
    bio: 'Swasthya Setu operates a chain of zero-cost diagnostic clinics in Kolkata\'s North 24 Parganas district, offering free blood tests, X-rays, and specialist consultations. We partner with government hospitals to ensure seamless referrals for critical cases.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 22.5726,
    longitude: 88.3639,
    locationName: 'Kolkata, West Bengal',
  },
  {
    organizationName: 'Vayu Raksha Samiti Jaipur',
    registrationNumber: 'MHA/NGO/RJ/2019/0267',
    email: 'air@vayuraksha.org',
    password: 'ShareSpace@2025',
    website: 'https://vayuraksha.org',
    missionArea: 'Environment',
    categories: ['Environment', 'Health'],
    bio: 'Vayu Raksha Samiti addresses Jaipur\'s rising air-pollution crisis through community-led waste-segregation drives, stubble-burning awareness campaigns in nearby villages, and a city-wide cycle-to-work initiative. Our advocacy has influenced two municipal pollution-reduction bye-laws.',
    image: 'https://images.unsplash.com/photo-1416169607655-0c2b3ce2e1cc?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 26.9124,
    longitude: 75.7873,
    locationName: 'Jaipur, Rajasthan',
  },
  {
    organizationName: 'Roti Ghar Ahmedabad',
    registrationNumber: 'MHA/NGO/GJ/2016/0349',
    email: 'serve@rotighar.org',
    password: 'ShareSpace@2025',
    website: 'https://rotighar.org',
    missionArea: 'Food',
    categories: ['Food'],
    bio: 'Roti Ghar operates community kitchens that serve freshly cooked, nutritious meals to construction workers, daily labourers, and homeless individuals across Ahmedabad at a symbolic cost of ₹5. Surplus produce from the APMC market is sourced daily to reduce food waste at scale.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 23.0225,
    longitude: 72.5714,
    locationName: 'Ahmedabad, Gujarat',
  },
  {
    organizationName: 'Naya Savera Welfare Trust',
    registrationNumber: 'MHA/NGO/UP/2020/0418',
    email: 'info@nayasavera.org',
    password: 'ShareSpace@2025',
    website: 'https://nayasavera.org',
    missionArea: 'Poverty',
    categories: ['Poverty', 'Education'],
    bio: 'Naya Savera empowers marginalised communities in Lucknow through micro-finance groups, livelihood training in tailoring and handicrafts, and digital literacy camps. Our self-help group network has enabled over 3,200 women to achieve financial independence.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 26.8467,
    longitude: 80.9462,
    locationName: 'Lucknow, Uttar Pradesh',
  },
  {
    organizationName: 'Prayas Youth Foundation Bhopal',
    registrationNumber: 'MHA/NGO/MP/2018/0512',
    email: 'youth@prayasfoundation.org',
    password: 'ShareSpace@2025',
    website: 'https://prayasfoundation.org',
    missionArea: 'Education',
    categories: ['Education', 'Other'],
    bio: 'Prayas Youth Foundation mentors first-generation college students from tribal and rural Madhya Pradesh through scholarship programmes, career counselling, and industry internship tie-ups. Since 2018, we have sent 1,400 students to top colleges across the country.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 23.2599,
    longitude: 77.4126,
    locationName: 'Bhopal, Madhya Pradesh',
  },
  {
    organizationName: 'Sahara Jeevan Relief Organisation',
    registrationNumber: 'MHA/NGO/OR/2015/0176',
    email: 'relief@saharajeevan.org',
    password: 'ShareSpace@2025',
    website: 'https://saharajeevan.org',
    missionArea: 'Poverty',
    categories: ['Poverty', 'Food', 'Health'],
    bio: 'Sahara Jeevan provides immediate disaster relief and long-term rehabilitation support to cyclone and flood-affected communities in coastal Odisha. Our rapid-response teams have assisted over 55,000 families across 14 districts during natural calamities in the last decade.',
    image: 'https://images.unsplash.com/photo-1593113616828-6f22bca04804?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    verificationStatus: 'approved',
    latitude: 20.2961,
    longitude: 85.8245,
    locationName: 'Bhubaneswar, Odisha',
  },
];

// ─── Main seed function ────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🌱  Starting ShareSpace seed — ${NGO_SEED_DATA.length} NGOs\n`);

  let created = 0;
  let skipped = 0;

  for (const ngo of NGO_SEED_DATA) {
    const existing = await prisma.nGO.findUnique({ where: { email: ngo.email } });

    if (existing) {
      console.log(`  ⏭️  Skipped (already exists): ${ngo.organizationName}`);
      skipped++;
      continue;
    }

    const hashedPassword = await bcryptjs.hash(ngo.password, 10);

    await prisma.nGO.create({
      data: {
        ...ngo,
        password: hashedPassword,
      },
    });

    console.log(`  ✅  Created: ${ngo.organizationName} — ${ngo.locationName}`);
    created++;
  }

  console.log(`\n🎉  Seed complete — ${created} created, ${skipped} skipped.\n`);
}

main()
  .catch(err => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
