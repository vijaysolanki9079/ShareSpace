import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL or DIRECT_URL not set in environment');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function createTestNGO() {
  try {
    console.log('🚀 Creating test NGO user...\n');

    // Check if already exists
    const existing = await prisma.nGO.findUnique({
      where: { email: 'vijay1234@ngo.com' },
    });

    if (existing) {
      console.log('⚠️  Test NGO already exists!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    vijay1234@ngo.com');
      console.log('🔑 Password: vijay1234');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎯 Login URL: http://localhost:3000/login');
      console.log('📊 Dashboard: http://localhost:3000/ngo-dashboard\n');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('vijay1234', 10);

    // Create the NGO
    const ngo = await prisma.nGO.create({
      data: {
        organizationName: 'Test NGO - Vijay Community Care',
        registrationNumber: 'ABCDE1234F', // Valid PAN format
        email: 'vijay1234@ngo.com',
        password: hashedPassword,
        website: 'https://test-ngo.example.com',
        missionArea: 'Education',
        isVerified: true, // Pre-verify for testing
        verificationStatus: 'VERIFIED',
      },
    });

    console.log('✅ Test NGO Created Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    vijay1234@ngo.com');
    console.log('🔑 Password: vijay1234');
    console.log('🏢 Org:      Test NGO - Vijay Community Care');
    console.log('✓  Status:   VERIFIED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎯 Login URL: http://localhost:3000/login');
    console.log('📊 Dashboard: http://localhost:3000/ngo-dashboard');
    console.log('\nNGO ID:', ngo.id, '\n');
  } catch (error) {
    console.error('❌ Error creating test NGO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestNGO();
