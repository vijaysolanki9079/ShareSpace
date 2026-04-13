import bcrypt from 'bcryptjs';
import { encryptMfaSecret, generateBackupCodes, verifyTotpToken } from '@/lib/mfa';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/mfa/verify-setup
 * Verifies the TOTP code during FIRST-TIME MFA setup
 * 
 * Request body:
 * - ngoId: string
 * - code: string (6-digit code from authenticator app)
 * - secret: string (base32 secret returned from generate-secret endpoint)
 * 
 * On success: Stores hashed secret, backup codes, and returns them
 * On failure: Returns error, does NOT store anything
 */
export async function POST(request: NextRequest) {
  try {
    const { ngoId, code, secret } = await request.json();

    // ✅ Validation: Check all required fields present
    if (!ngoId || !code || !secret) {
      return NextResponse.json(
        { error: 'Missing required fields: ngoId, code, secret' },
        { status: 400 }
      );
    }

    // ✅ Validation: Code must be exactly 6 digits
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    // ✅ Validation: Secret must be base32 encoded (typical length 26-32)
    if (!/^[A-Z2-7=]+$/.test(secret)) {
      return NextResponse.json(
        { error: 'Invalid secret format. Must be base32 encoded.' },
        { status: 400 }
      );
    }

    // ✅ Validation: NGO exists
    const ngo = await prisma.nGO.findUnique({ where: { id: ngoId } });
    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    // ✅ Check if NGO already has MFA setup
    if (ngo.mfaSetupComplete) {
      return NextResponse.json(
        { error: 'MFA is already configured for this account' },
        { status: 400 }
      );
    }

    const isValid = verifyTotpToken(secret, code, 1);

    if (!isValid) {
      // Log failed verification attempt
      await prisma.mFAAuditLog.create({
        data: {
          ngoId,
          action: 'setup_failed',
          success: false,
          details: 'Invalid verification code provided during MFA setup'
        }
      }).catch((err: unknown) => console.error('Audit log error:', err));

      console.log(`[MFA] Setup verification failed for NGO: ${ngoId}`);

      return NextResponse.json(
        { error: 'Invalid verification code. Please try again. Make sure your device time is synchronized.' },
        { status: 401 }
      );
    }

    // ✅ Code is VALID! Now hash and store the secret + backup codes

    try {
      const encryptedSecret = encryptMfaSecret(secret);
      const backupCodes = generateBackupCodes(10);

      // Hash each backup code for storage
      const hashedBackupCodes = await Promise.all(
        backupCodes.map(code => bcrypt.hash(code, 10))
      );

      // ✅ Update NGO with MFA configuration (only after successful verification)
      const updatedNgo = await prisma.nGO.update({
        where: { id: ngoId },
        data: {
          mfaSetupComplete: true,
          mfaMethod: 'authenticator',
          mfaSecret: encryptedSecret,
          mfaBackupCodes: hashedBackupCodes,
          mfaSetupCompletedAt: new Date(),
          isFirstLogin: false,
          mfaFailedAttempts: 0,
          mfaLockedUntil: null
        }
      });

      // ✅ Log successful setup in audit trail
      await prisma.mFAAuditLog.create({
        data: {
          ngoId,
          action: 'setup_complete',
          success: true,
          details: 'MFA setup completed successfully with authenticator app'
        }
      }).catch((err: unknown) => console.error('Audit log error:', err));

      console.log(`[MFA] Setup complete for NGO: ${ngoId}`);

      // ✅ Return success + backup codes (ONE TIME ONLY - user must save)
      return NextResponse.json({
        success: true,
        message: 'MFA setup complete! Save your backup codes in a safe place.',
        backupCodes, // Plaintext backup codes - displayed only once
        ngoId: updatedNgo.id,
        email: updatedNgo.email
      });

    } catch (error) {
      console.error('[MFA] Error saving MFA configuration:', error);

      // Log the error
      await prisma.mFAAuditLog.create({
        data: {
          ngoId,
          action: 'setup_failed',
          success: false,
          details: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      }).catch((err: unknown) => console.error('Audit log error:', err));

      return NextResponse.json(
        { error: 'Failed to save MFA configuration. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[MFA] Verify setup error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    );
  }
}
