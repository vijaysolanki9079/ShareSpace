import { buildOtpAuthUrl, generateBackupCodes, generateBase32Secret } from '@/lib/mfa';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

/**
 * POST /api/auth/mfa/generate-secret
 * Generates REAL TOTP secret and backup codes for MFA setup
 * 
 * Request body:
 * - ngoId: string (id of NGO setting up MFA)
 * - method: 'authenticator' | 'webauthn'
 * - email: string (NGO email)
 * - organizationName: string (NGO name for display)
 * 
 * Returns: { secret, otpauthUrl, qrCodeUrl, backupCodes, expiresIn }
 */
export async function POST(request: NextRequest) {
  try {
    const { ngoId, method, email, organizationName } = await request.json();

    if (!ngoId || !method || !email || !organizationName) {
      return NextResponse.json(
        { error: 'Missing required fields: ngoId, method, email, organizationName' },
        { status: 400 }
      );
    }

    // Verify NGO exists
    const ngo = await prisma.nGO.findUnique({ where: { id: ngoId } });
    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    if (method === 'authenticator') {
      const secret = generateBase32Secret();
      const backupCodes = generateBackupCodes(10);
      const otpauthUrl = buildOtpAuthUrl(email, secret);

      // ✅ Generate QR code as data URL
      let qrCodeUrl = '';
      try {
        qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
          width: 250,
          margin: 1,
          errorCorrectionLevel: 'H',
          type: 'image/png'
        });
      } catch (qrError) {
        console.error('[MFA] QR code generation failed:', qrError);
        // Continue without QR code - manual entry still works
        qrCodeUrl = '';
      }

      console.log(`[MFA] Generated secret for NGO: ${ngoId}, email: ${email}`);
      
      return NextResponse.json({
        success: true,
        secret,
        otpauthUrl,
        qrCodeUrl: qrCodeUrl || null,
        backupCodes,
        expiresIn: 600 // 10 minutes to complete setup
      });

    } else if (method === 'webauthn') {
      return NextResponse.json({
        success: true,
        message: 'WebAuthn setup not yet implemented. Please use authenticator method.'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid MFA method' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Generate MFA secret error:', error);
    return NextResponse.json(
      { error: 'Failed to generate MFA secret' },
      { status: 500 }
    );
  }
}
