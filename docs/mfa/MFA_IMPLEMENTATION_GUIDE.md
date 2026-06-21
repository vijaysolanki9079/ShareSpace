# Real TOTP (One-Time Password) Implementation Guide

## Current Issues ❌
1. OTP verification accepts ANY 6-digit code (no real validation)
2. Missing `ngoId` and `code` in verification requests
3. Speakeasy library installed but not being used
4. No actual TOTP algorithm verification

## Real Implementation Steps ✅

### Phase 1: Backend Setup - Secret Generation & Hashing
**File:** `/app/api/auth/mfa/generate-secret/route.ts`

1. **Install & Import Speakeasy**
   - Generate real TOTP secret using speakeasy library
   - Create QR code with OTP auth URL
   - Return secret (NOT hashed yet, for setup phase)
   - Return QR code URL
   - Return expected backup codes

2. **Key Points:**
   - Secret should NOT be stored until verification
   - Store secret temporarily in database with expiration (10 mins)
   - OR store in encrypted session/cache
   - Include issuer name: "ShareSpace - NGO_Name"

---

### Phase 2: Setup Verification - Real TOTP Code Verification
**File:** `/app/api/auth/mfa/verify-setup/route.ts`

1. **Request Validation**
   - Extract: `ngoId`, `code` (6-digit), `secret`
   - Validate ngoId exists in database
   - Validate code is exactly 6 digits

2. **Real TOTP Verification using Speakeasy**
   ```javascript
   // Verify the code against the secret
   const verified = speakeasy.totp.verify({
     secret: secret,           // From request body
     encoding: 'base32',
     token: code,              // User-entered 6 digits
     window: 1                 // Allow ±30 second window (1 time step)
   });
   ```

3. **If Verification Succeeds:**
   - Hash the secret with bcrypt (before storing)
   - Generate 10 backup codes
   - Hash each backup code with bcrypt
   - Update NGO in database:
     - `mfaSetupComplete = true`
     - `mfaMethod = 'authenticator'`
     - `mfaSecret = hashedSecret`
     - `mfaBackupCodes = [hashedCode1, hashedCode2, ...]`
     - `mfaSetupCompletedAt = now`
     - `isFirstLogin = false`
   - Create MFAAuditLog entry: action='setup_complete'
   - Return success + backup codes (ONE TIME ONLY)

4. **If Verification Fails:**
   - Create MFAAuditLog entry: action='setup_failed'
   - Return error: "Invalid verification code"
   - Do NOT store anything

---

### Phase 3: Login Verification - Verify Existing User's Code
**File:** `/app/api/auth/mfa/verify-login/route.ts`

1. **Request Validation**
   - Extract from request: `ngoId`, `code`
   - Validate both are present (fixes missing fields error!)
   - Validate code is 6 digits

2. **Rate Limiting & Account Lock Check**
   - Get NGO from database
   - Check if `mfaLockedUntil` > now
   - If locked: return "Account temporarily locked. Try again in X minutes"
   - Check `mfaFailedAttempts` count
   - If >= 5: lock account for 15 minutes

3. **Try TOTP Verification First**
   ```javascript
   // Compare user-entered code with stored secret
   const verified = speakeasy.totp.verify({
     secret: storedSecret,     // Retrieved from database
     encoding: 'base32',
     token: code,              // User-entered code
     window: 1                 // ±30 second window
   });
   ```

4. **If TOTP Succeeds:**
   - Reset `mfaFailedAttempts = 0`
   - Update `lastLoginAt = now`
   - Create MFAAuditLog entry: action='verify_success'
   - Return success

5. **If TOTP Fails, Try Backup Codes:**
   - Loop through each hashed backup code
   - `bcrypt.compare(userCode, hashedBackupCode)`
   - If match found:
     - Remove that backup code from database
     - Reset `mfaFailedAttempts = 0`
     - Update `lastLoginAt = now`
     - Create MFAAuditLog entry: action='backup_code_used'
     - Return success

6. **If Both TOTP & Backup Codes Fail:**
   - Increment `mfaFailedAttempts`
   - If `mfaFailedAttempts >= 5`:
     - Set `mfaLockedUntil = now + 15 minutes`
   - Create MFAAuditLog entry: action='verify_failed'
   - Return error with attempt count

---

### Phase 4: Frontend Updates - Pass Correct Data
**File:** `/components/ngo/MFASetup.tsx`
**File:** `/components/ngo/MFAFlowCoordinator.tsx`
**File:** `/components/ngo/MFAVerification.tsx`

1. **Setup Phase (First Time MFA)**
   - User enters 6-digit code from authenticator app
   - Call `/api/auth/mfa/verify-setup` with:
     ```json
     {
       "ngoId": "...",
       "code": "123456",
       "secret": "JBSWY3DPEBLW64TMMUXAXO2I62A"
     }
     ```

2. **Login Phase (Returning User)**
   - User enters 6-digit code from authenticator app (or backup code)
   - Call `/api/auth/mfa/verify-login` with:
     ```json
     {
       "ngoId": "...",
       "code": "123456"
     }
     ```

---

### Phase 5: Database Updates
**File:** `/prisma/schema.prisma`

Verify these fields exist on NGO model:
```prisma
model NGO {
  // ... existing fields

  // MFA Fields
  mfaSetupComplete      Boolean       @default(false)
  mfaMethod             String?       // 'authenticator' or 'webauthn'
  mfaSecret             String?       // Hashed TOTP secret
  mfaBackupCodes        String[]      // Array of hashed backup codes
  mfaSetupCompletedAt   DateTime?
  isFirstLogin          Boolean       @default(true)
  lastLoginAt           DateTime?
  mfaFailedAttempts     Int           @default(0)
  mfaLockedUntil        DateTime?     // Account lockout timestamp

  // Relations
  mfaAuditLogs          MFAAuditLog[]
}

model MFAAuditLog {
  id        String   @id @default(cuid())
  ngoId     String
  ngo       NGO      @relation(fields: [ngoId], references: [id])

  action    String   // 'setup_complete', 'verify_success', 'verify_failed', 'backup_code_used', etc.
  success   Boolean
  details   String?
  ipAddress String?

  createdAt DateTime @default(now())

  @@index([ngoId])
  @@index([action])
}
```

---

## Testing Checklist

### Test Case 1: First-Time Setup
- [ ] User logs in
- [ ] MFA warning appears
- [ ] User selects authenticator method
- [ ] QR code displays (scan with Google Authenticator)
- [ ] User enters OTP code from app
- [ ] Backend verifies code matches secret
- [ ] Backup codes displayed (save them)
- [ ] Session created, redirected to dashboard

### Test Case 2: Account Locked After 5 Failed Attempts
- [ ] User logs in (returning user with MFA enabled)
- [ ] User enters wrong code 5 times
- [ ] Account locks for 15 minutes
- [ ] 6th attempt shows "Account locked" message
- [ ] After 15 mins, account unlocks

### Test Case 3: Backup Code Usage
- [ ] User loses authenticator app
- [ ] User enters backup code instead
- [ ] Code verified and marked as used
- [ ] Backup code removed from database
- [ ] Cannot reuse same backup code

### Test Case 4: NGO Audit Logging
- [ ] Every MFA action logged to MFAAuditLog table
- [ ] Log includes: ngoId, action, success, timestamp
- [ ] Can query audit trail for compliance

---

## Implementation Order

1. **Install/Setup Speakeasy** - Verify it's properly installed
2. **Update Schema** - Ensure all fields exist
3. **Update generate-secret endpoint** - Use real speakeasy
4. **Update verify-setup endpoint** - Real TOTP verification
5. **Update verify-login endpoint** - Real TOTP + backup code handling
6. **Update Frontend Components** - Pass ngoId and code correctly
7. **Test Complete Flow** - End-to-end testing
8. **Deploy & Monitor** - Watch audit logs

---

## Security Considerations ⚠️

1. **Secret Storage**: Always hash before storing in DB
2. **Backup Codes**: Hash with bcrypt, one-time use only
3. **Rate Limiting**: Lock account after 5 failed attempts
4. **Audit Logging**: Log all MFA events for compliance
5. **Time Window**: Use window=1 (±30 seconds) for TOTP
6. **HTTPS Only**: MFA requires encrypted connections
7. **Session Security**: Create session only AFTER successful MFA

---

## Dependencies Status
- ✅ speakeasy - Already installed
- ✅ bcryptjs - Already installed
- ✅ qrcode - Already installed (for QR generation)

---

Ready to implement? Confirm and I'll proceed with all changes! 🚀
