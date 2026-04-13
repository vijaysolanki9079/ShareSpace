import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

type DemoAccount = {
  email: string;
  password: string;
  name: string;
  registrationNumber: string;
  missionArea: string;
  locationName: string;
};

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
        name: getEnvValue(`NGO_DEMO_NAME${suffix}`) ?? `Demo NGO${suffix ? ' 2' : ''}`,
        registrationNumber:
          getEnvValue(`NGO_DEMO_REGISTRATION_NUMBER${suffix}`) ??
          `DEMO${suffix ? '002' : '001'}`,
        missionArea: getEnvValue(`NGO_DEMO_MISSION_AREA${suffix}`) ?? 'Community Support',
        locationName: getEnvValue(`NGO_DEMO_LOCATION_NAME${suffix}`) ?? 'Delhi, India',
      } satisfies DemoAccount,
    ];
  });
}

async function getOrCreateDemoNgoAccount(account: DemoAccount) {
  const hashedPassword = await bcrypt.hash(account.password, 10);

  return prisma.nGO.upsert({
    where: { email: account.email },
    update: {
      password: hashedPassword,
      verificationStatus: 'approved',
      isVerified: true,
    },
    create: {
      email: account.email,
      password: hashedPassword,
      organizationName: account.name,
      registrationNumber: account.registrationNumber,
      missionArea: account.missionArea,
      verificationStatus: 'approved',
      isVerified: true,
      bio: 'Environment-configured demo NGO account',
      latitude: 28.6139,
      longitude: 77.209,
      locationName: account.locationName,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    let ngo = await prisma.nGO.findUnique({
      where: { email: normalizedEmail },
    });

    if (!ngo) {
      const demoAccount = getDemoAccounts().find((account) => account.email === normalizedEmail);

      if (demoAccount && password === demoAccount.password) {
        ngo = await getOrCreateDemoNgoAccount(demoAccount);
      }
    }

    if (!ngo) {
      return NextResponse.json(
        { error: 'Invalid NGO credentials' },
        { status: 401 }
      );
    }

    if (!(await bcrypt.compare(password, ngo.password))) {
      return NextResponse.json(
        { error: 'Invalid NGO credentials' },
        { status: 401 }
      );
    }

    if (ngo.verificationStatus !== 'approved' || !ngo.isVerified) {
      return NextResponse.json(
        { error: 'Your NGO account is pending approval' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: ngo.id,
      email: ngo.email,
      name: ngo.organizationName,
      isApproved: ngo.verificationStatus === 'approved',
      hasMFAEnrolled: ngo.mfaSetupComplete,
    });
  } catch (error) {
    console.error('NGO login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
