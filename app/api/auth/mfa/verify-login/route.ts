import bcrypt from 'bcryptjs';
import { decryptMfaSecret, verifyTotpToken } from '@/lib/mfa';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/mfa/verify-login
 * Verifies TOTP code or backup code during login (for users who already have MFA setup)
 * 
 * Request body:
 * - ngoId: string (NGO id)
 * - code: string (6-digit TOTP code OR 12-character backup code)
 * 
 * Returns: { success: boolean, message: string, attemptsRemaining?: number }
 * 
 * Features:
 * - Real TOTP verification using a local RFC 6238 implementation
 * - Backup code fallback (one-time use only)
 * - Rate limiting (5 failed attempts)
 * - Account lockout (15 minutes after 5 failures)
 * - Audit logging for all attempts
 */
export async function POST(request: NextRequest) {
  try {
    const { ngoId, code } = await request.json();

    // ✅ Validation: Check required fields
    if (!ngoId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: ngoId, code' },
        { status: 400 }
      );
    }

    // ✅ Validation: Code must be 6-12 characters
    if (!code || code.length < 6 || code.length > 12) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    // ✅ Get NGO from database
    const ngo = await prisma.nGO.findUnique({ where: { id: ngoId } });
    if (!ngo) {
      return NextResponse.json({ error: 'NGO not found' }, { status: 404 });
    }

    // ✅ Check if MFA is set up
    if (!ngo.mfaSetupComplete || !ngo.mfaSecret) {
      return NextResponse.json(
        { error: 'MFA not set up for this NGO' },
        { status: 400 }
      );
    }

    // ✅ Check if account is locked due to too many failed attempts
    if (ngo.mfaLockedUntil && ngo.mfaLockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (ngo.mfaLockedUntil.getTime() - new Date().getTime()) / 60000
      );

      await prisma.mFAAuditLog.create({
        data: {
          ngoId,
          action: 'verify_login_blocked',
          success: false,
          details: `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`
        }
      }).catch((err: unknown) => console.error('Audit log error:', err));

      return NextResponse.json(
        {
          error: `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          success: false,
          locked: true,
          lockedUntil: ngo.mfaLockedUntil
        },
        { status: 429 }
      );
    }

    // ✅ Try TOTP verification first (6 digits)
    let isValid = false;
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      try {
        const secret = decryptMfaSecret(ngo.mfaSecret);
        console.log(`[MFA] Decrypted secret for NGO ${ngoId}, length: ${secret.length}`);
        // Use window of 2 to account for time sync issues (allows ±2 time periods)
        isValid = verifyTotpToken(secret, code, 2);
        console.log(`[MFA] TOTP verification result for NGO ${ngoId}: ${isValid}`);
      } catch (error) {
        console.error('[MFA] TOTP verification error for NGO ' + ngoId + ':', error);
        // Continue to try backup codes
      }
    }

    // ✅ If TOTP failed, try backup codes (should contain hyphens)
    if (!isValid && ngo.mfaBackupCodes && ngo.mfaBackupCodes.length > 0) {
      for (let i = 0; i < ngo.mfaBackupCodes.length; i++) {
        try {
          // Compare with hashed backup code
          const match = await bcrypt.compare(code, ngo.mfaBackupCodes[i]);
          if (match) {
            // ✅ Backup code matched!
            // Remove it from list (one-time use only)
            const updatedBackupCodes = ngo.mfaBackupCodes.filter(
              (_: string, index: number) => index !== i
            );

            await prisma.nGO.update({
              where: { id: ngoId },
              data: {
                mfaBackupCodes: updatedBackupCodes,
                lastLoginAt: new Date(),
                mfaFailedAttempts: 0  // Reset failed attempts on success
              }
            });

            // Log backup code usage
            await prisma.mFAAuditLog.create({
              data: {
                ngoId,
                action: 'verify_login_success',
                success: true,
                details: `Backup code used for login (${ngo.mfaBackupCodes.length - 1} remaining)`
              }
            }).catch((err: unknown) => console.error('Audit log error:', err));

            console.log(`[MFA] Login verified for NGO: ${ngoId} via backup code`);

            return NextResponse.json({
              success: true,
              message: 'MFA verification successful',
              method: 'backup_code'
            });
          }
        } catch (error) {
          console.error('[MFA] Backup code comparison error:', error);
        }
      }
    }

    // ❌ Neither TOTP nor backup code matched
    if (!isValid) {
      // Increment failed attempts
      const newFailedAttempts = (ngo.mfaFailedAttempts || 0) + 1;
      const attemptsRemaining = Math.max(0, 5 - newFailedAttempts);

      // Check if should lock account
      const updateData: { mfaFailedAttempts: number; mfaLockedUntil?: Date } = {
        mfaFailedAttempts: newFailedAttempts
      };

      if (newFailedAttempts >= 5) {
        // Lock account for 15 minutes
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        updateData.mfaLockedUntil = lockedUntil;

        await prisma.mFAAuditLog.create({
          data: {
            ngoId,
            action: 'account_locked',
            success: false,
            details: `Account locked after 5 failed MFA attempts`
          }
        }).catch((err: unknown) => console.error('Audit log error:', err));
      } else {
        // Log failed attempt
        await prisma.mFAAuditLog.create({
          data: {
            ngoId,
            action: 'verify_login_failed',
            success: false,
            details: `Failed MFA verification (attempt ${newFailedAttempts}/5)`
          }
        }).catch((err: unknown) => console.error('Audit log error:', err));
      }

      // Update NGO with new attempts count
      await prisma.nGO.update({
        where: { id: ngoId },
        data: updateData
      });

      console.log(
        `[MFA] Login verification failed for NGO: ${ngoId} (attempt ${newFailedAttempts}/5)`
      );

      // Return appropriate error message
      if (newFailedAttempts >= 5) {
        return NextResponse.json(
          {
            error: 'Invalid code. Your account has been locked for 15 minutes due to too many failed attempts.',
            success: false,
            locked: true
          },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          {
            error: `Invalid verification code. ${attemptsRemaining} attempt(s) remaining before account lockout.`,
            success: false,
            attemptsRemaining
          },
          { status: 401 }
        );
      }
    }

    // ✅✅✅ TOTP verification successful
    // Reset failed attempts and update last login
    await prisma.nGO.update({
      where: { id: ngoId },
      data: {
        lastLoginAt: new Date(),
        mfaFailedAttempts: 0,
        mfaLockedUntil: null
      }
    });

    // Log successful verification
    await prisma.mFAAuditLog.create({
      data: {
        ngoId,
        action: 'verify_login_success',
        success: true,
        details: 'MFA verification passed during login'
      }
    }).catch((err: unknown) => console.error('Audit log error:', err));

    console.log(`[MFA] Login verified for NGO: ${ngoId}`);

    return NextResponse.json({
      success: true,
      message: 'MFA verification successful',
      method: 'totp'
    });

  } catch (error) {
    console.error('[MFA] Verify login error:', error);
    return NextResponse.json(
      {
        error: 'Verification failed. Please try again.',
        success: false
      },
      { status: 500 }
    );
  }
}
