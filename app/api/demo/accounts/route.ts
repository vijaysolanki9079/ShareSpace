import { NextResponse } from 'next/server';

/**
 * Demo account credentials for testing.
 * These are environment-driven test accounts.
 */
export async function GET() {
  const demo1Email = process.env.NGO_DEMO_EMAIL || 'demo@sharespace.dev';
  const demo1Password = process.env.NGO_DEMO_PASSWORD || 'DemoMFA@2024!';
  const demo1Name = process.env.NGO_DEMO_NAME || 'Demo NGO MFA';

  const demo2Email = process.env.NGO_DEMO_EMAIL_2 || 'demo2@sharespace.dev';
  const demo2Password = process.env.NGO_DEMO_PASSWORD_2 || 'DemoMFA2@2024!';
  const demo2Name = process.env.NGO_DEMO_NAME_2 || 'Demo NGO MFA 2';

  return NextResponse.json({
    message: 'ShareSpace Demo Accounts for Testing',
    demoAccounts: [
      {
        type: 'NGO Account 1',
        email: demo1Email,
        password: demo1Password,
        organizationName: demo1Name,
        loginUrl: '/ngo-login',
        notes: 'Has MFA setup enabled (requires verification during login)',
      },
      {
        type: 'NGO Account 2',
        email: demo2Email,
        password: demo2Password,
        organizationName: demo2Name,
        loginUrl: '/ngo-login',
        notes: 'Has MFA setup enabled (requires verification during login)',
      },
      {
        type: 'Regular User',
        email: 'user@example.com',
        password: 'userPassword123',
        loginUrl: '/login',
        notes: 'Create via /signup page',
      },
      {
        type: 'Google OAuth',
        email: 'any-google-account@gmail.com',
        password: 'N/A (use Google login button)',
        loginUrl: '/login',
        notes: 'Requires GOOGLE_ID and GOOGLE_SECRET env vars configured',
      },
    ],
    googleAuthDebug: {
      status: process.env.GOOGLE_ID && process.env.GOOGLE_SECRET ? 'Configured' : 'Not Configured',
      checkEndpoint: '/api/debug/auth-config',
    },
    signUpUrl: '/signup',
    ngoSignUpUrl: '/register-ngo',
  });
}
