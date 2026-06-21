import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    const hasGoogleId = !!process.env.GOOGLE_ID;
    const hasGoogleSecret = !!process.env.GOOGLE_SECRET;
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL;
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;

    return NextResponse.json({
      google: { configured: hasGoogleId && hasGoogleSecret },
      nextAuth: { url: hasNextAuthUrl, secret: hasNextAuthSecret },
      callbackUrlExample: `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/callback/google`,
    });
  } catch (err) {
    console.error('auth debug error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
