// Defensive import to avoid TypeScript issues across @prisma/client versions
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

function getEnvValue(key: string) {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function getDemoAccounts() {
  if (process.env.ENABLE_NGO_DEMO_LOGIN !== 'true') {
    return [];
  }

  const suffixes = ['', '_2'];

  return suffixes.flatMap((suffix) => {
    const email = getEnvValue(`NGO_DEMO_EMAIL${suffix}`);
    const password = getEnvValue(`NGO_DEMO_PASSWORD${suffix}`);

    if (!email || !password) {
      return [];
    }

    return [
      {
        email: email.toLowerCase(),
        password,
        organizationName: getEnvValue(`NGO_DEMO_NAME${suffix}`) ?? `Demo NGO${suffix ? ' 2' : ''}`,
        registrationNumber:
          getEnvValue(`NGO_DEMO_REGISTRATION_NUMBER${suffix}`) ??
          `DEMO${suffix ? '002' : '001'}`,
        missionArea: getEnvValue(`NGO_DEMO_MISSION_AREA${suffix}`) ?? 'Community Support',
        verificationStatus: 'approved',
        isVerified: true,
        bio: 'Environment-configured demo NGO account',
        latitude: 28.6139,
        longitude: 77.2090,
        locationName: getEnvValue(`NGO_DEMO_LOCATION_NAME${suffix}`) ?? 'Delhi, India',
      },
    ];
  });
}

async function main() {
  const demoAccounts = getDemoAccounts();

  if (demoAccounts.length === 0) {
    console.log('No demo NGO accounts configured. Skipping demo seed.');
    return;
  }

  console.log(`Seeding ${demoAccounts.length} environment-configured demo NGO account(s)...`);

  for (const account of demoAccounts) {
    try {
      const hashedPassword = await bcryptjs.hash(account.password, 10);
      const existingNGO = await prisma.nGO.findUnique({
        where: { email: account.email },
      });

      if (existingNGO) {
        console.log(`NGO with email ${account.email} already exists. Skipping...`);
      } else {
        const createdNGO = await prisma.nGO.create({
          data: {
            ...account,
            password: hashedPassword,
          },
        });
        console.log(`Created NGO account: ${createdNGO.email}`);
      }
    } catch (error) {
      console.error(`Error creating NGO ${account.email}:`, error);
    }
  }

  console.log('Demo NGO seed completed!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
