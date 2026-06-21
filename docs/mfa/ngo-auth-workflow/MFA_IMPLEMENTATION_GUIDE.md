# MFA Integration Guide: NGO Login Flow
## Complete Implementation Strategy with AI Prompts

---

## 📋 Overview

You have two React components for MFA:
- **MFASetup** - First-time setup (authenticator app or security key)
- **MFAVerification** - Verification during login

**Key Requirement**: On first NGO login, MFA setup must be MANDATORY with a warning screen.

---

## 🎯 Phase 1: Pre-Login MFA Warning Screen

### What You Need to Create
A **mandatory warning/onboarding screen** that appears ONCE when an NGO admin logs in for the first time.

### Fixed AI Prompt to Generate This Component

```
Create a React component called "MFAOnboardingWarning" that:

1. Displays a MANDATORY MFA setup warning screen
2. Shows:
   - Bold warning icon/message in red/orange tone
   - Title: "Set Up Two-Factor Authentication (Mandatory)"
   - Description: "You cannot proceed without setting up 2FA. This is required for security."
   - Bullet points explaining why MFA is mandatory:
     * Protects your NGO account from unauthorized access
     * Required for compliance and data security
     * One-time setup, only ~2 minutes
   - Two buttons: "Set Up Now" (primary), "Learn More" (secondary)
   - Prevent back navigation/dismissal (no X button)

3. Props:
   - onContinueToMFA: () => void (navigate to MFA setup)
   - ngoName: string
   - email: string

4. Use emerald-600 for accent colors, professional tone, Framer Motion for animations
5. Lock down the UI - no way to skip or exit without starting MFA setup

Output: Full React component with TypeScript interfaces
```

---

## 🎯 Phase 2: Integration with Login Flow

### Step 1: Update Your Login Component

**Pseudo-code logic:**

```typescript
// In your login component
const handleLoginSuccess = async (credentials) => {
  const user = await authenticateUser(credentials);

  // Check if this is user's first login AND MFA not yet set up
  if (user.isFirstLogin && !user.mfaSetupComplete) {
    // Show mandatory warning screen
    navigate('/mfa-onboarding-warning');
  } else if (!user.mfaSetupComplete) {
    // Existing user without MFA (shouldn't happen with your logic)
    navigate('/mfa-onboarding-warning');
  } else {
    // MFA already set up, proceed to verification
    navigate('/mfa-verification', { method: user.mfaMethod });
  }
};
```

### Step 2: Create a Route/Flow Structure

```
Login Page
  ↓
(Successful Credentials)
  ↓
[DB Check: mfaSetupComplete === false?]
  ├─ YES → MFA Onboarding Warning (MANDATORY)
  │         ↓
  │     [User clicks "Set Up Now"]
  │         ↓
  │     MFA Setup (Authenticator/WebAuthn)
  │         ↓
  │     MFA Verification
  │         ↓
  │     Dashboard/Success
  │
  └─ NO → MFA Verification (if MFA is set up)
          ↓
          Dashboard/Success
```

---

## 🎯 Phase 3: Backend Requirements

### Database Schema Updates

```sql
-- Add to your NGO/User table
ALTER TABLE users ADD COLUMN (
  mfaSetupComplete BOOLEAN DEFAULT FALSE,
  mfaMethod ENUM('authenticator', 'webauthn') DEFAULT NULL,
  mfaSecret VARCHAR(255) DEFAULT NULL,
  mfaBackupCodes JSON DEFAULT NULL,
  mfaSetupCompletedAt TIMESTAMP DEFAULT NULL,
  isFirstLogin BOOLEAN DEFAULT TRUE
);
```

### API Endpoints Needed

1. **POST /api/auth/mfa/check-setup-status**
   - Request: { userId }
   - Response: { mfaSetupComplete, mfaMethod, isFirstLogin }

2. **POST /api/auth/mfa/generate-secret**
   - Request: { userId, method: 'authenticator' | 'webauthn' }
   - Response: { secret, qrCodeUrl, backupCodes }
   - Backend should use library: `speakeasy` (TOTP) or `@simplewebauthn/server`

3. **POST /api/auth/mfa/verify-setup**
   - Request: { userId, method, code (6-digit for authenticator) }
   - Response: { success, message }
   - Marks `mfaSetupComplete = TRUE` if verification succeeds

4. **POST /api/auth/mfa/verify-login**
   - Request: { userId, code }
   - Response: { success, sessionToken }
   - Called during login after password verification

5. **POST /api/auth/mfa/backup-codes**
   - Request: { userId }
   - Response: { codes: string[] }
   - Generate 10 one-time backup codes during setup

---

## 🎯 Phase 4: Flow Integration with Your Components

### Prompt for Creating Flow Coordinator

```
Create a React component called "MFAFlowCoordinator" that manages the entire MFA flow:

1. Props:
   - userId: string
   - email: string
   - ngoName: string
   - onFlowComplete: () => void (navigate to dashboard after MFA setup)
   - isFirstLogin: boolean

2. Internal state management:
   - currentStep: 'warning' | 'setup' | 'verification' | 'complete'
   - selectedMethod: 'authenticator' | 'webauthn' | null
   - loading: boolean

3. Flow logic:
   - If isFirstLogin === true, show MFAOnboardingWarning
   - Only allow progression through: Warning → Setup → Verification → Complete
   - Prevent back navigation (no going back once warning is accepted)
   - On verification success, call onFlowComplete() to redirect to dashboard

4. Handle these transitions:
   - Warning "Set Up Now" → Setup component (default to authenticator)
   - Setup "Continue" → Verification component
   - Verification success → Success screen → onFlowComplete()
   - Verification failure → Stay on verification, show error

5. Make API calls to:
   - POST /api/auth/mfa/generate-secret (when entering setup)
   - POST /api/auth/mfa/verify-setup (when completing setup)

Output: Full React component with state management
```

---

## 🎯 Phase 5: Implementation Checklist

### Frontend
- [ ] Create MFAOnboardingWarning component
- [ ] Create MFAFlowCoordinator wrapper component
- [ ] Update Login component with post-login redirect logic
- [ ] Add routing for: `/mfa-onboarding`, `/mfa-setup`, `/mfa-verify`, `/mfa-success`
- [ ] Integrate the two components you already have (MFASetup, MFAVerification)
- [ ] Add loading states and error handling
- [ ] Test on mobile (especially authenticator app switching)

### Backend
- [ ] Add MFA columns to database
- [ ] Create `/api/auth/mfa/generate-secret` endpoint
- [ ] Create `/api/auth/mfa/verify-setup` endpoint
- [ ] Create `/api/auth/mfa/verify-login` endpoint
- [ ] Install dependencies:
  - `speakeasy` (TOTP verification)
  - `qrcode` (QR code generation on backend, optional)
  - `@simplewebauthn/server` (WebAuthn/FIDO2 support)
- [ ] Implement session handling (create session only after MFA verification)
- [ ] Add database migrations

### Security Considerations
- [ ] Store MFA secret encrypted in database (use bcrypt or similar)
- [ ] Rate-limit MFA verification attempts (max 5 per minute)
- [ ] Generate cryptographically secure backup codes (16 alphanumeric chars)
- [ ] Log all MFA-related events (setup, verification, failures)
- [ ] Warn users about backup codes (show once, let them download)
- [ ] Add MFA reset flow for account recovery (with admin verification)

---

## 🎯 Phase 6: Code Example - Login Component Integration

```typescript
// pages/login.tsx (or LoginPage.tsx)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MFAFlowCoordinator from '@/components/MFAFlowCoordinator';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMFAFlow, setShowMFAFlow] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Store temporary session (not full auth yet)
        setCurrentUser({
          userId: data.userId,
          email: data.email,
          ngoName: data.ngoName,
          mfaSetupComplete: data.mfaSetupComplete,
          isFirstLogin: data.isFirstLogin
        });

        // Redirect to MFA flow
        setShowMFAFlow(true);
        setIsFirstLogin(data.isFirstLogin);
      } else {
        // Handle login error
        setError(data.message);
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  // Show MFA flow if user successfully logged in with password
  if (showMFAFlow && currentUser) {
    return (
      <MFAFlowCoordinator
        userId={currentUser.userId}
        email={currentUser.email}
        ngoName={currentUser.ngoName}
        isFirstLogin={isFirstLogin}
        onFlowComplete={() => {
          // MFA setup/verification complete, grant full session
          navigate('/dashboard');
        }}
      />
    );
  }

  // Regular login form (email + password)
  return (
    <div>
      <form onSubmit={handleLogin}>
        {/* Email input */}
        {/* Password input */}
        {/* Submit button */}
      </form>
    </div>
  );
}
```

---

## 🎯 Phase 7: API Endpoint Examples (Node.js/Express)

### Generate MFA Secret

```typescript
POST /api/auth/mfa/generate-secret

// Request body:
{
  userId: "user123",
  method: "authenticator"
}

// Response:
{
  secret: "JBSWY3DPEBLW64TMMUXAXO2I62A",
  qrCodeUrl: "otpauth://totp/...",
  backupCodes: ["ABC12345", "DEF67890", ...],
  expiresIn: 600 // seconds (10 min to complete setup)
}

// Pseudo-code:
const speakeasy = require('speakeasy');

app.post('/api/auth/mfa/generate-secret', async (req, res) => {
  const { userId, method } = req.body;

  if (method === 'authenticator') {
    const secret = speakeasy.generateSecret({
      name: `${ngoName} (${email})`
    });

    // Generate 10 backup codes
    const backupCodes = generateBackupCodes();

    // Store temporarily (expire in 10 min)
    await redis.setex(`mfa:pending:${userId}`, 600, JSON.stringify({
      secret: secret.base32,
      backupCodes,
      createdAt: Date.now()
    }));

    res.json({
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      backupCodes
    });
  }
});
```

### Verify Setup

```typescript
POST /api/auth/mfa/verify-setup

// Request body:
{
  userId: "user123",
  code: "123456",
  method: "authenticator"
}

// Response:
{
  success: true,
  message: "MFA setup complete"
}

// Pseudo-code:
const speakeasy = require('speakeasy');

app.post('/api/auth/mfa/verify-setup', async (req, res) => {
  const { userId, code, method } = req.body;

  if (method === 'authenticator') {
    // Get pending secret from Redis
    const pending = await redis.get(`mfa:pending:${userId}`);
    const { secret, backupCodes } = JSON.parse(pending);

    // Verify the TOTP code
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow ±2 time windows
    });

    if (verified) {
      // Store encrypted secret in database
      await User.update(
        { id: userId },
        {
          mfaSetupComplete: true,
          mfaMethod: 'authenticator',
          mfaSecret: encryptSecret(secret),
          mfaBackupCodes: hashBackupCodes(backupCodes),
          mfaSetupCompletedAt: new Date(),
          isFirstLogin: false
        }
      );

      // Clear pending data
      await redis.del(`mfa:pending:${userId}`);

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: 'Invalid code' });
    }
  }
});
```

### Verify Login (MFA)

```typescript
POST /api/auth/mfa/verify-login

// Request body:
{
  userId: "user123",
  code: "123456"
}

// Response:
{
  success: true,
  sessionToken: "jwt_token_here"
}

// Pseudo-code:
app.post('/api/auth/mfa/verify-login', async (req, res) => {
  const { userId, code } = req.body;

  const user = await User.findById(userId);

  const verified = speakeasy.totp.verify({
    secret: decryptSecret(user.mfaSecret),
    encoding: 'base32',
    token: code,
    window: 2
  });

  if (verified) {
    // Create full session
    const sessionToken = jwt.sign(
      { userId, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, sessionToken });
  } else {
    res.status(401).json({ success: false, error: 'Invalid MFA code' });
  }
});
```

---

## 🎯 Phase 8: Testing Strategy

### Test Cases

**First Login Flow:**
1. [ ] Login with email/password
2. [ ] See MFA Onboarding Warning (mandatory)
3. [ ] Click "Set Up Now"
4. [ ] See MFA Setup screen
5. [ ] Scan QR code or copy secret
6. [ ] Enter verification code
7. [ ] Success screen, redirect to dashboard
8. [ ] Logout and login again
9. [ ] Should see MFA Verification (not setup)

**Error Cases:**
- [ ] Invalid TOTP code → show error, allow retry
- [ ] Timeout during setup → show warning, allow restart
- [ ] Lost authenticator app → use backup codes
- [ ] Wrong backup code → show error

**Mobile Testing:**
- [ ] Authenticator app can scan QR code
- [ ] Code input field is numeric keyboard
- [ ] Forms are responsive

---

## 📝 Summary

### What to Do:

1. **Create 2 new components:**
   - `MFAOnboardingWarning` - Mandatory first-login warning
   - `MFAFlowCoordinator` - Manages the entire flow

2. **Use your existing components:**
   - `MFASetup` (already provided)
   - `MFAVerification` (already provided)

3. **Create backend endpoints** (5 total)

4. **Update database schema** (add MFA columns)

5. **Integrate with login flow** (post-login redirect)

6. **Add security measures** (rate limiting, encryption, logging)

---

## 💡 Key Points

✅ **First login** → Warning → Setup → Verify → Dashboard
✅ **Subsequent logins** → Just MFA Verification
✅ **No way to skip** MFA on first login (it's mandatory)
✅ **Backup codes** for account recovery
✅ **Mobile-friendly** QR code scanning
✅ **Rate limiting** on verification attempts

---

## 🚀 Next Steps

1. Use the prompts in this guide to ask Claude to generate the missing components
2. Implement the backend endpoints
3. Update your database
4. Test the complete flow
5. Deploy with confidence!

Good luck! 🎯
