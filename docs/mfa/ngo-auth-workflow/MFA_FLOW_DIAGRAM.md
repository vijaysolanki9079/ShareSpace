# 🎯 MFA Login Flow - Visual Diagram

## Complete Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NGO LOGIN FLOW WITH MFA                          │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   LOGIN PAGE     │
                              │ (Email + Pwd)    │
                              └────────┬─────────┘
                                       │
                                       │ User enters email & password
                                       ↓
                              ┌──────────────────┐
                              │  API: /login     │
                              │  Authenticate    │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
            ❌ Invalid Creds              ✅ Valid Creds
                    │                          │
                    │                          ↓
             Show Error         ┌──────────────────────────┐
                    │           │ Check Database:          │
                    │           │ mfaSetupComplete = ?     │
                    │           └──────────┬───────────────┘
                    │                      │
                    │    ┌─────────────────┼─────────────────┐
                    │    │                 │                 │
                    │  FALSE           TRUE            (AND isFirstLogin)
                    │    │                 │                 │
    ┌───────────────┴┐   │         ┌───────↓──────┐  ┌──────↓──────┐
    │  Retry login  │   │         │ MFA Verify   │  │ MFA Warning │
    └───────────────┘   │         │ (Existing)   │  │ (First Time)│
                        │         └───────┬──────┘  └──────┬──────┘
                        │                 │                │
                        │                 │    ┌───────────┴──────────────┐
                        │                 │    │                          │
                        │                 │    ↓                          ↓
                        │                 │ ┌──────────────┐   ┌──────────────────┐
                        │                 │ │ VERIFICATION │   │ ONBOARDING WARN. │
                        │                 │ │ SCREEN       │   │ (MANDATORY!)     │
                        │                 │ │              │   │                  │
                        │                 │ │ "Enter 6-dig"│   │ ⚠️ Explain WHY   │
                        │                 │ │              │   │ 🔒 MANDATORY     │
                        │                 │ └──────┬───────┘   │ ✓ Checkbox req'd │
                        │                 │        │            └────────┬─────────┘
                        │                 │        │                    │
                        │                 │    ┌───┴────────────────┐   │
                        │                 │    │                    │   │
                        │                 │    ↓                    ↓   ↓
                        │                 │ ┌──────────┐   ┌────────────────┐
                        │                 │ │ VERIFY   │   │ METHOD SELECT  │
                        │                 │ │ CODE     │   │ Authenticator  │
                        │                 │ │          │   │ Security Key   │
                        │                 │ └──────┬───┘   └────────┬───────┘
                        │                 │        │                │
    ┌───────────────────┼─────────────────┴────────┼────────────────┘
    │                   │                          │
    │ ❌ Invalid Code   │ ✅ Valid Code           │
    │ (Retry)           │                         ↓
    │                   │              ┌──────────────────┐
    │ ❌ 5 Attempts     │              │  MFA SETUP PAGE  │
    │ (Lock 15 min)     │              │                  │
    │                   │              │ 1. Download App  │
    │                   │              │ 2. Scan QR       │
    │                   │              │ 3. Get backup cd │
    │                   │              └────────┬─────────┘
    │                   │                       │
    │                   │                       ↓
    │                   │              ┌──────────────────┐
    │                   │              │ VERIFY SETUP     │
    │                   │              │                  │
    │                   │              │ Enter 6-digit    │
    │                   │              │ code             │
    │                   │              └────────┬─────────┘
    │                   │                       │
    │                   │   ┌───────────────────┼──────────────┐
    │                   │   │                   │              │
    │                   │   │ ❌ Invalid   ✅ Valid        TIMEOUT
    │                   │   │ (Retry)      (Success)       (Restart)
    │                   │   │   │               │              │
    │                   │   │   │               ↓              │
    │                   │   │   │      ┌──────────────────┐   │
    │                   │   │   │      │ SUCCESS SCREEN   │   │
    │                   │   │   │      │                  │   │
    │                   │   │   │      │ ✅ 2FA Enabled   │   │
    │                   │   │   │      │ 🎉 Setup Done    │   │
    │                   │   │   │      └────────┬─────────┘   │
    │                   │   │   │               │              │
    │                   │   └───┼───────────────┼──────────────┘
    │                   │       │               │
    │                   │       │        ┌──────↓───────┐
    │                   │       │        │  Dashboard   │
    │                   │       │        │  (Logged in) │
    │                   │       │        └──────────────┘
    │                   │       │
    │                   └───────┘
    │
    │ (Next login - user already has MFA)
    │
    └─────────────────────────────────────────────────────────────────┘
```

---

## State Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                     MFA FLOW COORDINATOR                       │
│                      (State Machine)                           │
└────────────────────────────────────────────────────────────────┘

    INITIAL STATE
         │
         ├─ If isFirstLogin=true  → 'warning'
         └─ If isFirstLogin=false → 'verification'

    ┌─────────────────────────────────────────────────────────┐
    │                 'warning' STATE                         │
    │         MFAOnboardingWarning Component                 │
    │                                                         │
    │  - Show mandatory warning                              │
    │  - Require checkbox acknowledgment                     │
    │  - "Set Up Now" button → 'setup'                      │
    │  - Cannot skip or go back                             │
    └──────────────────┬──────────────────────────────────────┘
                       │
                       │ handleContinueFromWarning()
                       ↓
    ┌─────────────────────────────────────────────────────────┐
    │            'setup' STATE (Method Select)               │
    │         MFAMethodSelection Component                   │
    │                                                         │
    │  - Show method options                                 │
    │    * Authenticator App                                 │
    │    * Security Key                                      │
    │  - Click method → handleSetupMethodSelected()          │
    │  - Generate secret from API                            │
    │  - Set selectedMethod state                            │
    └──────────────────┬──────────────────────────────────────┘
                       │
                       │ handleSetupMethodSelected(method)
                       ↓
    ┌─────────────────────────────────────────────────────────┐
    │            'setup' STATE (With Method)                 │
    │          MFASetup Component                            │
    │                                                         │
    │  - Show QR code + secret                               │
    │  - Copy-to-clipboard secret                            │
    │  - "Continue" button → 'verification'                 │
    │  - "Back" button → select method again                |
    └──────────────────┬──────────────────────────────────────┘
                       │
                       │ handleSetupComplete()
                       ↓
    ┌─────────────────────────────────────────────────────────┐
    │           'verification' STATE                         │
    │         MFAVerification Component                      │
    │                                                         │
    │  - For Authenticator: Show code input                  │
    │  - For WebAuthn: Show "touch key" prompt              │
    │  - Call /api/auth/mfa/verify-setup                    │
    │  - On success → 'complete'                            │
    │  - On error → stay in 'verification'                  │
    └──────────────────┬──────────────────────────────────────┘
                       │
                       │ handleVerificationComplete()
                       ↓
    ┌─────────────────────────────────────────────────────────┐
    │             'complete' STATE                           │
    │        Success Screen + Redirect                       │
    │                                                         │
    │  - Show ✅ Setup Complete                             │
    │  - Call parent onFlowComplete()                        │
    │  - Navigate to /dashboard                             │
    └─────────────────────────────────────────────────────────┘
```

---

## Database State Changes

```
BEFORE MFA SETUP
┌──────────────────────────────────┐
│ User Record                      │
├──────────────────────────────────┤
│ id: 123                          │
│ email: admin@ngo.org             │
│ mfaSetupComplete: FALSE      ⬅─ START HERE
│ mfaMethod: NULL                  │
│ mfaSecret: NULL                  │
│ mfaBackupCodes: NULL             │
│ isFirstLogin: TRUE               │
└──────────────────────────────────┘
          │
          │ handleSetupMethodSelected('authenticator')
          │ → API: /generate-secret
          │ → Redis: store pending secret (10 min expiry)
          ↓
DURING MFA SETUP (Temporary in Redis)
┌──────────────────────────────────┐
│ Redis: mfa:pending:{userId}      │
├──────────────────────────────────┤
│ secret: "JBSWY3DPE..."           │
│ backupCodes: [...]               │
│ createdAt: timestamp             │
│ expiresAt: +10 minutes           │
└──────────────────────────────────┘
          │
          │ User enters verification code
          │ → API: /verify-setup
          │ → speakeasy.totp.verify()
          │ → SUCCESS
          ↓
AFTER MFA SETUP
┌──────────────────────────────────┐
│ User Record (Updated)            │
├──────────────────────────────────┤
│ id: 123                          │
│ email: admin@ngo.org             │
│ mfaSetupComplete: TRUE       ⬅─ NOW TRUE!
│ mfaMethod: "authenticator"       │
│ mfaSecret: (encrypted)           │
│ mfaBackupCodes: (hashed)         │
│ isFirstLogin: FALSE          ⬅─ NOW FALSE!
│ mfaSetupCompletedAt: timestamp   │
└──────────────────────────────────┘
          │
          │ Redis: mfa:pending:{userId} → DELETED
          │
          ↓
NEXT LOGIN
User enters email/password
→ Check: mfaSetupComplete = TRUE
→ Skip warning
→ Go straight to verification
→ On success: Create session + redirect to dashboard
```

---

## Component Tree

```
LoginPage
│
├─ [if showMFAFlow && currentUser]
│  │
│  └─ MFAFlowCoordinator
│     ├─ State: currentStep, selectedMethod, mfaData, error, loading
│     │
│     ├─ When currentStep = 'warning'
│     │  └─ MFAOnboardingWarning
│     │     ├─ Props: onContinueToMFA, ngoName, email
│     │     └─ User acknowledges + clicks "Set Up Now"
│     │        → sets currentStep = 'setup'
│     │
│     ├─ When currentStep = 'setup' && !selectedMethod
│     │  └─ MFAMethodSelection
│     │     ├─ Option 1: Authenticator App
│     │     ├─ Option 2: Security Key
│     │     └─ handleSetupMethodSelected(method)
│     │        → generates secret
│     │        → sets selectedMethod
│     │
│     ├─ When currentStep = 'setup' && selectedMethod
│     │  └─ MFASetup
│     │     ├─ Props: method, email, ngoName, onSetupComplete, onBack
│     │     ├─ Shows QR code + secret (for authenticator)
│     │     ├─ Shows security key instructions (for webauthn)
│     │     └─ handleSetupComplete()
│     │        → sets currentStep = 'verification'
│     │
│     ├─ When currentStep = 'verification'
│     │  └─ MFAVerification
│     │     ├─ Props: method, email, onVerificationComplete, onBack
│     │     ├─ Code input (6 digits)
│     │     ├─ Verify code against stored secret
│     │     └─ handleVerificationComplete()
│     │        → API: /mark-complete
│     │        → sets currentStep = 'complete'
│     │        → after 1.5s: calls parent onFlowComplete()
│     │
│     └─ Error Toast (if error state)
│        └─ Shows error messages from API
│
└─ [else]
   └─ Normal login form

```

---

## API Call Sequence

```
LOGIN FLOW API CALLS
═════════════════════════════════════════════════════════════════

1️⃣  POST /api/auth/login
    Request:  { email, password }
    Response: {
      success: true,
      userId: "user123",
      email: "admin@ngo.org",
      ngoName: "My NGO",
      mfaSetupComplete: false,  ⬅─ First login
      isFirstLogin: true
    }
    → User sees MFAOnboardingWarning

2️⃣  POST /api/auth/mfa/generate-secret
    Request:  { userId, method: 'authenticator', email, ngoName }
    Response: {
      secret: "JBSWY3DPEBLW64TMMUXAXO2I62A",
      qrCodeUrl: "otpauth://totp/...",
      backupCodes: ["ABC123", "DEF456", ...],
      expiresIn: 600
    }
    → User sees MFASetup with QR code
    → User scans or copies secret to authenticator app

3️⃣  POST /api/auth/mfa/verify-setup
    Request:  { userId, code: "123456", method: 'authenticator' }
    Response: { success: true, message: "MFA setup complete" }
    OR
    Response: { success: false, error: "Invalid code" }
    → On success: User sees success screen
    → On failure: User retries entering code

4️⃣  POST /api/auth/mfa/mark-complete
    Request:  { userId }
    Response: { success: true }
    → Backend sets mfaSetupComplete = true
    → Clears pending data from Redis
    → User redirected to dashboard (onFlowComplete)

─────────────────────────────────────────────────────────────────

NEXT LOGIN (User already has MFA)
═════════════════════════════════════════════════════════════════

1️⃣  POST /api/auth/login
    Request:  { email, password }
    Response: {
      success: true,
      userId: "user123",
      email: "admin@ngo.org",
      ngoName: "My NGO",
      mfaSetupComplete: true,  ⬅─ Already set up
      isFirstLogin: false
    }
    → Skip MFAOnboardingWarning
    → Go straight to MFAVerification

2️⃣  POST /api/auth/mfa/verify-login
    Request:  { userId: "user123", code: "123456" }
    Response: { success: true, sessionToken: "eyJhbGc..." }
    OR
    Response: { success: false, error: "Invalid code" }
    → On success: Create session + redirect to dashboard
    → On failure: Allow retry (max 5 attempts)

```

---

## Error Handling Flow

```
ERROR SCENARIOS & HANDLING
═════════════════════════════════════════════════════════════════

❌ Invalid TOTP Code (Verify Setup)
   └─ setError('Invalid code. Please try again.')
   └─ Clear code input
   └─ Allow retry (max 5 per minute)
   └─ After 5 failures: "Setup failed. Contact support."

❌ Invalid TOTP Code (Verify Login)
   └─ setError('Invalid code. Please try again.')
   └─ Allow retry (max 5 per minute)
   └─ After 5 failures: Lock account for 15 minutes
   └─ Suggest using backup code if available

❌ Network Timeout (Generate Secret)
   └─ Show: "Network error. Please try again."
   └─ Retry button
   └─ If persistent: "Contact support"

❌ MFA Setup Expired (>10 minutes)
   └─ "Setup expired. Please start over."
   └─ Button to restart setup
   └─ Clear Redis pending data

❌ Lost Authenticator App
   └─ User should use backup codes
   └─ If no backup codes: "Contact support for account recovery"
   └─ Admin can reset MFA via admin panel

❌ WebAuthn Device Not Detected
   └─ "No security key detected. Insert device and try again."
   └─ Allow retry or fallback to authenticator app

```

---

## Summary: Flow at a Glance

```
👤 NGO Admin Logs In
  │
  ├─ Email + Password ✅ Valid
  │
  └─ Check: isFirstLogin & !mfaSetupComplete?
     │
     ├─ YES → 🟠 MANDATORY MFA ONBOARDING
     │        (Cannot skip or go back)
     │        │
     │        └─ 1. See warning about why 2FA is mandatory
     │           2. Check acknowledgment box
     │           3. Click "Set Up Now"
     │           4. Choose method (Authenticator or Security Key)
     │           5. Complete setup (scan QR, get secret)
     │           6. Verify with 6-digit code
     │           7. See success screen
     │           8. Redirected to dashboard
     │
     └─ NO → 🟢 NORMAL VERIFICATION
             (User already has MFA set up)
             │
             └─ 1. Skip warning
                2. Go straight to verification
                3. Enter 6-digit code
                4. Create session
                5. Redirected to dashboard

```

---

## Key Points to Remember

✅ **First Login = Mandatory MFA**
   - Users CANNOT proceed without completing MFA setup
   - If they skip, they lose account access
   - No back button to escape the flow

✅ **Second Login = Just Verification**
   - Only need to enter the 6-digit code
   - Much faster than setup
   - Or use backup codes if authenticator unavailable

✅ **Database State Matters**
   - `mfaSetupComplete` flag determines which flow to show
   - `isFirstLogin` flag determines if warning is shown
   - Both are updated after successful verification

✅ **Security**
   - Rate limiting on verification (5 attempts/minute)
   - Account lockout after 5 failures (15 min lockout)
   - Backup codes for emergency access
   - Encrypted storage of secrets

✅ **No Way to Skip**
   - Warning screen has no X button
   - Back button only goes to method selection
   - Cannot dismiss warning without checking box
   - Only way out is to complete the setup
