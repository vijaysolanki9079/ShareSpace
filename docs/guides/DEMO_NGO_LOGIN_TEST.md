# Demo NGO Login Test Guide

## ✅ API Endpoint Status
The `/api/auth/ngo-login` endpoint is now **WORKING** with enhanced logging.

### Verify via Terminal
```bash
# Test Demo Account 1
curl -X POST http://localhost:3000/api/auth/ngo-login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@sharespace.dev", "password": "DemoMFA@2024!"}'

# Expected Response (200 OK)
# {"id":"...","email":"demo@sharespace.dev","name":"Demo NGO MFA","isApproved":true,"hasMFAEnrolled":true}

# Test Demo Account 2
curl -X POST http://localhost:3000/api/auth/ngo-login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo2@sharespace.dev", "password": "DemoMFA2@2024!"}'
```

## 🧪 UI Testing Checklist

### Step 1: NGO Login Form
1. Open http://localhost:3000/ngo-login
2. Enter email: `demo@sharespace.dev`
3. Enter password: `DemoMFA@2024!`
4. Click "Sign In with Email"
5. **Expected**: Form should process and show MFA flow (no error)

### Step 2: MFA Onboarding (First Login)
1. **Should see**: "Two-Factor Authentication Setup" screen
2. **Expected flow**:
   - Warning about MFA importance (first login only)
   - Method selection (Authenticator or WebAuthn)
   - Setup screen with QR code
   - Backup codes display
   - Verification with TOTP code

### Step 3: MFA Verification (Subsequent Logins)
1. **After first login completion**, logout and login again
2. Click "Sign In with Email"
3. **Should see**: TOTP verification screen
4. **Expected**: Enter 6-digit code from authenticator app

### Step 4: Dashboard Access
1. After successful MFA verification
2. **Should redirect**: To `/ngo-dashboard`
3. **Expected**: NGO dashboard loads with organization data

## 📊 Server Logs to Watch
When testing, check terminal for these logs:
```
[ngo-login] Attempting login for: demo@sharespace.dev
[ngo-login] Comparing password for: demo@sharespace.dev
[ngo-login] Password match result: true
[ngo-login] Login successful for: demo@sharespace.dev
```

## 🚀 Full End-to-End Flow
```
1. NGO Login Form
   ↓
2. Credentials Verified via /api/auth/ngo-login
   ↓
3. MFA Flow (Setup if first login, Verify if returning)
   ↓
4. Create NextAuth Session
   ↓
5. Redirect to /ngo-dashboard
```

## 🔍 Debug Endpoints
If needed, check these debug endpoints:
- `GET /api/debug/auth-config` - Show OAuth config status
- `GET /api/demo/accounts` - List demo credentials

## 📝 Demo Credentials

### Primary Account
- Email: `demo@sharespace.dev`
- Password: `DemoMFA@2024!`
- Organization: Demo NGO MFA
- Reg. Number: DEMO-MFA-001
- Location: Delhi, India

### Secondary Account
- Email: `demo2@sharespace.dev`
- Password: `DemoMFA2@2024!`
- Organization: Demo NGO MFA 2
- Reg. Number: DEMO-MFA-002
- Location: Mumbai, India

## ⚙️ Environment Setup Verification
```bash
# Check .env.local has demo login enabled
grep "ENABLE_NGO_DEMO_LOGIN" .env.local  # Should output: ENABLE_NGO_DEMO_LOGIN=true

# Check demo credentials are set
grep "NGO_DEMO_EMAIL" .env.local  # Should show demo@sharespace.dev
grep "NGO_DEMO_PASSWORD" .env.local  # Should show DemoMFA@2024!
```

## 🐛 Troubleshooting

### "Invalid NGO credentials" error
1. Verify email is exactly: `demo@sharespace.dev` (case insensitive, but will be normalized)
2. Verify password is exactly: `DemoMFA@2024!` (case sensitive)
3. Check `.env.local` has `ENABLE_NGO_DEMO_LOGIN=true`
4. Check terminal logs for detailed error messages
5. Ensure dev server picked up env changes: `pkill -f "npm run dev"` then `npm run dev`

### MFA setup not appearing
1. First login should show MFA setup screen (isFirstLogin should be true)
2. Check browser console for errors
3. Verify MFAFlowCoordinator component is loading
4. Check that ngoId is being passed correctly from API response

### Session not created after MFA complete
1. Verify NextAuth is configured correctly in `lib/auth.ts`
2. Check credentials provider is registered
3. Verify JWT_SECRET and NEXTAUTH_SECRET are set in `.env.local`

## ✨ What's Been Fixed
- Enhanced logging in `/app/api/auth/ngo-login/route.ts`
- Demo account creation with proper bcrypt hashing
- Password verification logic verified correct
- Both demo accounts tested and working (200 OK responses)
- Comprehensive debug output for troubleshooting
