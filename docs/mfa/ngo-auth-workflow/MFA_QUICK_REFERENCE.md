# 🎯 MFA Implementation - Quick Reference & AI Prompts

## Files Generated for You ✅

1. **MFAOnboardingWarning.tsx** - Mandatory warning screen
2. **MFAFlowCoordinator.tsx** - Flow orchestration & method selection
3. **MFASetup.tsx** - *(Already provided by you)*
4. **MFAVerification.tsx** - *(Already provided by you)*

---

## 📌 Integration in 3 Steps

### Step 1: Update Your Login Component

```typescript
// pages/LoginPage.tsx

import MFAFlowCoordinator from '@/components/MFAFlowCoordinator';

export default function LoginPage() {
  const [showMFAFlow, setShowMFAFlow] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store user info and show MFA flow
      setCurrentUser({
        userId: data.userId,
        email: data.email,
        ngoName: data.ngoName,
        isFirstLogin: data.isFirstLogin
      });
      setShowMFAFlow(true);
    }
  };

  if (showMFAFlow && currentUser) {
    return (
      <MFAFlowCoordinator
        userId={currentUser.userId}
        email={currentUser.email}
        ngoName={currentUser.ngoName}
        isFirstLogin={currentUser.isFirstLogin}
        onFlowComplete={() => {
          // MFA complete, redirect to dashboard
          navigate('/dashboard');
        }}
      />
    );
  }

  // Normal login form...
}
```

### Step 2: Create Backend API Endpoints

**Copy-paste these prompts into Claude to generate backend code:**

#### Prompt A: Generate MFA Secret Endpoint

```
Create a Node.js/Express endpoint POST /api/auth/mfa/generate-secret that:

1. Receives: { userId, method: 'authenticator' | 'webauthn', email, ngoName }

2. If method === 'authenticator':
   - Use speakeasy library to generate TOTP secret
   - Create QR code URL using otpauth protocol
   - Generate 10 backup codes (16 alphanumeric chars each)
   - Store temporarily in Redis with 10-minute expiry
   - Return: { secret, qrCodeUrl, backupCodes, expiresIn: 600 }

3. If method === 'webauthn':
   - Use @simplewebauthn/server to generate challenge
   - Store challenge in Redis for 10 minutes
   - Return challenge for client-side registration

4. Error handling for invalid userId, database errors

Use speakeasy library. Handle errors gracefully.
```

#### Prompt B: Verify Setup Endpoint

```
Create a Node.js/Express endpoint POST /api/auth/mfa/verify-setup that:

1. Receives: { userId, code, method }

2. For 'authenticator' method:
   - Get pending secret from Redis (key: mfa:pending:{userId})
   - Use speakeasy.totp.verify() to verify the 6-digit code
   - Allow ±2 time windows (window: 2)
   - If verified:
     * Store encrypted secret in database
     * Hash and store backup codes in database
     * Update user.mfaSetupComplete = true
     * Update user.mfaMethod = 'authenticator'
     * Delete from Redis
     * Return: { success: true }
   - If invalid: Return 400 with error message

3. For 'webauthn' method:
   - Use @simplewebauthn/server to verify response
   - Store credential in database
   - Mark MFA as complete

4. Include rate limiting (max 5 attempts per minute)
5. Log all MFA setup attempts for security audit

Use bcrypt for secret encryption.
```

#### Prompt C: Verify Login Endpoint

```
Create a Node.js/Express endpoint POST /api/auth/mfa/verify-login that:

1. Receives: { userId, code }

2. Verify TOTP code:
   - Get encrypted secret from database
   - Decrypt it
   - Use speakeasy.totp.verify() with ±2 window
   - If valid:
     * Create JWT session token (24h expiry)
     * Update user.lastLoginAt = now
     * Log successful MFA verification
     * Return: { success: true, sessionToken }
   - If invalid:
     * Increment failed attempt counter
     * Return 401 error after 5 failed attempts, lockout for 15 min
     * Return error message

3. Also handle backup code verification:
   - If code doesn't match TOTP, check backup codes
   - Each backup code is one-time use only
   - Delete used backup code from database

4. Include detailed logging for security audit
5. Rate limit to 5 attempts per minute per user

Use jwt.sign() for token creation.
```

#### Prompt D: Database Schema

```
Create Prisma schema for MFA fields on User model:

Add to User model:
- mfaSetupComplete: Boolean @default(false)
- mfaMethod: String? (enum: 'authenticator' | 'webauthn')
- mfaSecret: String? (encrypted, will store encrypted TOTP secret)
- mfaBackupCodes: String[]? (JSON array of hashed backup codes)
- mfaSetupCompletedAt: DateTime?
- isFirstLogin: Boolean @default(true)
- lastLoginAt: DateTime?
- mfaFailedAttempts: Int @default(0)
- mfaLockedUntil: DateTime?

Create migration file for this.
Also create MFAAuditLog model to track all MFA events:
- id
- userId
- action: 'setup' | 'verify' | 'failed_verify' | 'backup_code_used'
- success: Boolean
- ipAddress: String
- createdAt: DateTime
```

### Step 3: Install Dependencies

```bash
# Backend dependencies
npm install speakeasy qrcode @simplewebauthn/server jsonwebtoken bcrypt
npm install --save-dev @types/speakeasy

# Frontend dependencies (you likely already have these)
npm install framer-motion lucide-react
```

---

## 🔒 Security Checklist

### Backend Security

- [ ] **Encryption**: Use bcrypt (saltRounds: 10) to encrypt TOTP secrets
- [ ] **Backup codes**: Hash backup codes (bcrypt) before storing
- [ ] **Rate limiting**: Max 5 MFA verification attempts per minute
- [ ] **Account lockout**: Lock after 5 failed attempts for 15 minutes
- [ ] **Time window**: Use ±2 time windows for TOTP verification (speakeasy default)
- [ ] **Audit logging**: Log all MFA events with timestamp, IP, user ID
- [ ] **Session handling**: Create full JWT session ONLY after successful MFA verification
- [ ] **HTTPS only**: Never send MFA codes over HTTP

### Frontend Security

- [ ] **No hardcoding secrets**: Remove any hardcoded test secrets
- [ ] **Secure input**: MFA code input should accept only digits
- [ ] **Clear sensitive data**: Clear code input on errors
- [ ] **No local storage**: Don't store secrets in browser storage
- [ ] **Timeout handling**: Gracefully handle network timeouts

---

## 🧪 Testing Checklist

### First Login Flow

```
Login with email/password
  ↓
See MFAOnboardingWarning
  ↓
Confirm understanding (checkbox)
  ↓
Click "Set Up Now"
  ↓
See method selection (Authenticator / Security Key)
  ↓
Click "Authenticator App"
  ↓
See QR code + secret
  ↓
Copy secret to authenticator app (or scan QR)
  ↓
Enter 6-digit code
  ↓
See success screen
  ↓
Redirected to dashboard
```

### Subsequent Logins

```
Login with email/password
  ↓
See MFAVerification (skip warning)
  ↓
Enter 6-digit code
  ↓
Session created, redirected to dashboard
```

### Error Cases

- [ ] Invalid TOTP code → error message, allow retry
- [ ] Timeout during setup → warning, restart option
- [ ] Lost authenticator → use backup codes
- [ ] Account recovery → support contact

---

## 📱 Mobile Testing

- [ ] Authenticator app can scan QR code from device
- [ ] Code input field shows numeric keyboard
- [ ] Forms are responsive on mobile
- [ ] Switching between browser and authenticator app works
- [ ] Copy-to-clipboard works on mobile

---

## 🚀 Deployment Checklist

**Before going live:**

- [ ] Test all API endpoints thoroughly
- [ ] Implement rate limiting in production
- [ ] Enable HTTPS for all MFA requests
- [ ] Set up audit logging to persistent storage
- [ ] Create account recovery procedure (admin bypass)
- [ ] Document backup code storage (tell users to save them)
- [ ] Set up alerts for suspicious MFA activity
- [ ] Test database encryption in production
- [ ] Verify environment variables for secrets are set
- [ ] Create user documentation
- [ ] Test with real authenticator apps (Google, Microsoft, Authy)

---

## 💾 Environment Variables Needed

```env
# Backend
JWT_SECRET=your-super-secret-key
ENCRYPTION_KEY=your-encryption-key-for-mfa-secrets
REDIS_URL=redis://localhost:6379
DATABASE_URL=your-database-connection

# Optional
WEBAUTHN_RP_ID=yourdomain.com
WEBAUTHN_RP_NAME=Your NGO Name
WEBAUTHN_ORIGIN=https://yourdomain.com
```

---

## 📚 Reference Links

**Libraries Used:**
- Speakeasy TOTP: https://www.npmjs.com/package/speakeasy
- SimpleWebAuthn: https://simplewebauthn.dev/
- Framer Motion: https://www.framer.com/motion/
- Lucide Icons: https://lucide.dev/

**Security Standards:**
- TOTP RFC 6238: https://tools.ietf.org/html/rfc6238
- FIDO2/WebAuthn: https://webauthn.me/
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html

---

## ❓ FAQ

**Q: Can users skip MFA on first login?**
A: No. The warning screen cannot be dismissed without completing setup. If they skip, they won't be able to log in again.

**Q: What if user loses their authenticator phone?**
A: They should have saved backup codes. If not, contact admin for account recovery.

**Q: How long does setup take?**
A: 2-3 minutes. It's a one-time setup.

**Q: Can users have multiple MFA methods?**
A: Yes, you can extend the system to allow multiple methods for redundancy.

**Q: What happens if MFA verification fails?**
A: After 5 failed attempts, the account locks for 15 minutes. Backup codes can be used as alternative.

---

## 🎁 Bonus: Account Recovery Flow

**If user locks themselves out:**

```
Admin Dashboard → User Management
  ↓
Find user → Click "Reset MFA"
  ↓
Confirmation dialog
  ↓
User's MFA marked as incomplete
  ↓
User logs in next time → Sees setup warning again
  ↓
Can set up new MFA method
```

*Prompt for this (optional):*
```
Create an admin endpoint POST /api/admin/mfa/reset-user that:
- Requires admin authentication
- Takes { userId, adminId }
- Sets user.mfaSetupComplete = false
- Clears user.mfaSecret, mfaBackupCodes
- Logs the action with admin ID and timestamp
- Returns success/error
- Sends email to user: "MFA was reset by admin. Set it up again on next login."
```

---

## 🎯 Summary

**You have:**
✅ MFAOnboardingWarning.tsx (mandatory warning)
✅ MFAFlowCoordinator.tsx (flow management + method selection)
✅ MFASetup.tsx (setup UI - already provided)
✅ MFAVerification.tsx (verification UI - already provided)

**You need to create:**
❌ Backend API endpoints (5 endpoints)
❌ Database schema updates
❌ Login integration
❌ Error handling & recovery

**Use the prompts above to generate these with Claude!**

Good luck! 🚀
