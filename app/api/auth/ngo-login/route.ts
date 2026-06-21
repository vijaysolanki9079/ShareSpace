import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { checkRequestRateLimitShared, rateLimitResponse } from '@/lib/rate-limit';

type DemoAccount = {
  email: string;
  password: string;
  name: string;
  registrationNumber: string;
  categories: string[];
  locationName: string;
};

const isDev = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => {
  if (isDev) console.log(...args);
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
        categories: [
          getEnvValue(`NGO_DEMO_MISSION_AREA${suffix}`) ?? 'Community Support',
        ],
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
      missionArea: account.categories[0],
      categories: account.categories,
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
    const rateLimit = await checkRequestRateLimitShared(
      request,
      'ngo-login',
      10,
      15 * 60 * 1000,
      normalizedEmail
    );
    if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

    debugLog('[ngo-login] Attempting login for:', normalizedEmail);

    let ngo = await prisma.nGO.findUnique({
      where: { email: normalizedEmail },
    });

    if (!ngo) {
      debugLog('[ngo-login] NGO not found in DB, checking demo accounts...');
      const demoAccounts = getDemoAccounts();
      debugLog('[ngo-login] Available demo accounts:', demoAccounts.map(a => a.email));
      
      const demoAccount = demoAccounts.find((account) => account.email === normalizedEmail);

      if (demoAccount) {
        debugLog('[ngo-login] Demo account found for:', normalizedEmail);
        if (password === demoAccount.password) {
          debugLog('[ngo-login] Password match! Creating/updating demo NGO...');
          try {
            ngo = await getOrCreateDemoNgoAccount(demoAccount);
            debugLog('[ngo-login] Demo NGO created/updated:', ngo.id, ngo.email);
          } catch (dbErr) {
            console.error('[ngo-login] Failed to create demo account:', dbErr);
            throw dbErr;
          }
        } else {
          debugLog('[ngo-login] Password mismatch for demo account');
        }
      } else {
        debugLog('[ngo-login] No demo account found for email:', normalizedEmail);
      }
    }

    if (!ngo) {
      debugLog('[ngo-login] No NGO found after demo check');
      return NextResponse.json(
        { error: 'Invalid NGO credentials' },
        { status: 401 }
      );
    }

    debugLog('[ngo-login] Comparing password for:', ngo.email);
    const passwordMatch = await bcrypt.compare(password, ngo.password);
    debugLog('[ngo-login] Password match result:', passwordMatch);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid NGO credentials' },
        { status: 401 }
      );
    }

    if (ngo.verificationStatus !== 'approved' || !ngo.isVerified) {
      debugLog('[ngo-login] NGO not approved:', { status: ngo.verificationStatus, verified: ngo.isVerified });
      return NextResponse.json(
        { error: 'Your NGO account is pending approval' },
        { status: 403 }
      );
    }

    debugLog('[ngo-login] Login successful for:', ngo.email);
    return NextResponse.json({
      id: ngo.id,
      email: ngo.email,
      name: ngo.organizationName,
      isApproved: ngo.verificationStatus === 'approved',
      hasMFAEnrolled: ngo.mfaSetupComplete,
    });
  } catch (error) {
    console.error('[ngo-login] Error:', error instanceof Error ? error.message : error);
    console.error('[ngo-login] Full error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
