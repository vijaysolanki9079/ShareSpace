import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check if authentication sources are configured.
 * Do NOT expose this in production.
 */
export async function GET() {
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  return NextResponse.json({
    google: {
      configured: !!(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET),
      clientIdSet: !!process.env.GOOGLE_ID,
      clientSecretSet: !!process.env.GOOGLE_SECRET,
      hints: !process.env.GOOGLE_ID
        ? 'GOOGLE_ID environment variable is missing. Add it to .env.local'
        : !process.env.GOOGLE_SECRET
          ? 'GOOGLE_SECRET environment variable is missing. Add it to .env.local'
          : 'Google OAuth is configured',
    },
    nextauth: {
      secretSet: !!process.env.NEXTAUTH_SECRET,
      urlSet: !!process.env.NEXTAUTH_URL,
      urlValue: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      hints: !process.env.NEXTAUTH_SECRET
        ? 'NEXTAUTH_SECRET is missing. Run: npx auth secret'
        : !process.env.NEXTAUTH_URL
          ? 'NEXTAUTH_URL should be set (defaults to http://localhost:3000)'
          : 'NextAuth is configured',
    },
    database: {
      urlSet: !!process.env.DATABASE_URL,
      hints: !process.env.DATABASE_URL
        ? 'DATABASE_URL is missing from .env.local'
        : 'Database connection configured',
    },
    demoAccounts: {
      enabled: process.env.ENABLE_NGO_DEMO_LOGIN === 'true',
      demo1: {
        email: process.env.NGO_DEMO_EMAIL || 'demo@sharespace.dev',
        password: process.env.NGO_DEMO_PASSWORD || 'DemoMFA@2024!',
        name: process.env.NGO_DEMO_NAME || 'Demo NGO MFA',
      },
      demo2: {
        email: process.env.NGO_DEMO_EMAIL_2 || 'demo2@sharespace.dev',
        password: process.env.NGO_DEMO_PASSWORD_2 || 'DemoMFA2@2024!',
        name: process.env.NGO_DEMO_NAME_2 || 'Demo NGO MFA 2',
      },
      regularUserSignup: {
        hint: 'Use /signup to create a regular user account',
      },
    },
    environment: process.env.NODE_ENV,
    troubleshooting: {
      googleOAuthFailing: [
        '1. Verify GOOGLE_ID and GOOGLE_SECRET are set in .env.local',
        '2. In Google Cloud Console, ensure http://localhost:3000/api/auth/callback/google is listed under Authorized Redirect URIs',
        '3. Check browser console for the exact error during Google sign-in',
        '4. Ensure you are accessing the app via http://localhost:3000 (not 127.0.0.1)',
      ],
    },
  });
}
