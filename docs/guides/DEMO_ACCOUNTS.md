# ShareSpace Demo Accounts & Testing Guide

## Demo NGO Accounts (Pre-configured)

Both demo accounts have **MFA (Multi-Factor Authentication) enabled** and require verification during login.

### Demo Account 1
- **Type:** NGO Account
- **Email:** `demo@sharespace.dev` (or configured via `NGO_DEMO_EMAIL`)
- **Password:** `DemoMFA@2024!` (or configured via `NGO_DEMO_PASSWORD`)
- **Organization:** Demo NGO MFA
- **Login URL:** `/ngo-login`
- **Notes:** MFA setup is mandatory; you'll need to verify using TOTP during login

### Demo Account 2
- **Type:** NGO Account
- **Email:** `demo2@sharespace.dev` (or configured via `NGO_DEMO_EMAIL_2`)
- **Password:** `DemoMFA2@2024!` (or configured via `NGO_DEMO_PASSWORD_2`)
- **Organization:** Demo NGO MFA 2
- **Login URL:** `/ngo-login`
- **Notes:** MFA setup is mandatory; you'll need to verify using TOTP during login

## Create Your Own Accounts

### Create a Regular User Account
1. Go to `/signup`
2. Enter email, password, and full name
3. Click "Sign up"
4. You'll be redirected to `/login`
5. Log in with your new credentials

### Create an NGO Account
1. Go to `/register-ngo`
2. Fill in NGO details (organization name, registration number, location, etc.)
3. Submit the form
4. Account will be pending verification by admin
5. Once approved, you can log in at `/ngo-login`

## Google OAuth Sign-In

To enable Google OAuth sign-in:

1. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Navigate to "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy the Client ID and Client Secret

2. **Add to `.env.local`:**
   ```
   GOOGLE_ID=your_google_client_id_here
   GOOGLE_SECRET=your_google_client_secret_here
   ```

3. **Verify Configuration:**
   - Visit `/api/debug/auth-config` (dev mode only)
   - This will show whether Google OAuth is properly configured
   - It will display hints if something is missing

## Quick Links

| Purpose | URL |
|---------|-----|
| User Sign Up | `/signup` |
| User Login | `/login` |
| NGO Registration | `/register-ngo` |
| NGO Login | `/ngo-login` |
| Dashboard | `/dashboard` |
| NGO Dashboard | `/ngo-dashboard` |
| Check Auth Config | `/api/debug/auth-config` |
| View Demo Accounts | `/api/demo/accounts` |

## Troubleshooting Google Sign-In

If you see "An error occurred. Please try again." on the login page:

1. **Check Configuration:**
   - Visit `/api/debug/auth-config`
   - Verify both `GOOGLE_ID` and `GOOGLE_SECRET` show as configured
   - Check the hints provided for what's missing

2. **Verify Google Cloud Setup:**
   - Ensure `http://localhost:3000/api/auth/callback/google` is listed in authorized redirects
   - Do NOT use `127.0.0.1` – use `localhost` instead
   - Ensure the Client ID and Secret are correct

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages during Google sign-in attempt
   - Share error message if needed

4. **Check Server Logs:**
   - Look for `[NextAuth]` prefixed error messages in terminal
   - These will show database or callback errors

## Environment Variables Required

```
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_SECRET=... (run: npx auth secret)
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional, for OAuth sign-in)
GOOGLE_ID=...
GOOGLE_SECRET=...

# Demo Accounts (optional)
ENABLE_NGO_DEMO_LOGIN=true
NGO_DEMO_EMAIL=demo@sharespace.dev
NGO_DEMO_PASSWORD=DemoMFA@2024!
NGO_DEMO_NAME=Demo NGO MFA
```

## Testing Features

### With Demo NGO Account:
- ✅ NGO login with MFA
- ✅ NGO dashboard
- ✅ View donations
- ✅ Manage requests
- ✅ Chat with donors

### With Regular User Account:
- ✅ User sign up / login
- ✅ View NGOs nearby
- ✅ Donate to NGOs
- ✅ Chat with NGOs
- ✅ Track donation history

### With Google OAuth:
- ✅ Sign in with Google account
- ✅ Automatic user profile creation
- ✅ Faster authentication
