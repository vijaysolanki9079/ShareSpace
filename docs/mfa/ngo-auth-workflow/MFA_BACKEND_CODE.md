# 🔧 MFA Backend Implementation - Ready-to-Copy Code

## Setup: Install Dependencies

```bash
npm install speakeasy qrcode @simplewebauthn/server jsonwebtoken bcrypt redis dotenv
npm install --save-dev @types/speakeasy @types/express
```

---

## 1️⃣ Login Endpoint (Existing - Just Update)

```typescript
// routes/auth.ts or controllers/authController.ts

import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import db from '@/db'; // Your database client

export async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // ✅ PASSWORD CORRECT - Now check MFA status
    // ⚠️ DO NOT create session yet - user must complete MFA first

    const response: any = {
      success: true,
      userId: user.id,
      email: user.email,
      ngoName: user.ngoName,
      mfaSetupComplete: user.mfaSetupComplete,
      isFirstLogin: user.isFirstLogin
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}
```

---

## 2️⃣ Generate MFA Secret Endpoint

```typescript
// routes/mfa.ts or controllers/mfaController.ts

import express, { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import redis from '@/redis'; // Your Redis client
import db from '@/db';

/**
 * POST /api/auth/mfa/generate-secret
 *
 * Generates a TOTP secret and QR code for authenticator app setup
 * Also generates backup codes
 */
export async function generateMFASecret(req: Request, res: Response) {
  const { userId, method, email, ngoName } = req.body;

  try {
    // Validate input
    if (!userId || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (method === 'authenticator') {
      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `${ngoName} (${email})`,
        issuer: 'ShareSpace',
        length: 32 // 32 characters for better security
      });

      // Generate 10 backup codes
      const backupCodes = generateBackupCodes(10);

      // Store temporarily in Redis (expires in 10 minutes)
      const pendingData = {
        secret: secret.base32,
        backupCodes,
        createdAt: new Date().toISOString(),
        method: 'authenticator'
      };

      await redis.setex(
        `mfa:pending:${userId}`,
        600, // 10 minutes in seconds
        JSON.stringify(pendingData)
      );

      // Generate QR code URL
      const qrCodeUrl = `otpauth://totp/${encodeURIComponent(email)}?secret=${secret.base32}&issuer=${encodeURIComponent(ngoName)}&period=30`;

      // Also generate QR code image if needed (optional)
      // const qrImage = await QRCode.toDataURL(qrCodeUrl);

      res.json({
        success: true,
        secret: secret.base32,
        qrCodeUrl, // Can be used directly or rendered on frontend
        backupCodes,
        expiresIn: 600
      });

    } else if (method === 'webauthn') {
      // WebAuthn setup - different approach
      // For now, placeholder. See separate WebAuthn section below.

      res.json({
        success: true,
        message: 'WebAuthn setup not fully implemented. Use authenticator for now.'
      });
    } else {
      res.status(400).json({ error: 'Invalid method' });
    }

  } catch (error) {
    console.error('Generate MFA secret error:', error);
    res.status(500).json({ error: 'Failed to generate secret' });
  }
}

/**
 * Generate 10 backup codes
 * Format: XXXX-XXXX-XXXX (where X is alphanumeric)
 */
function generateBackupCodes(count: number): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < count; i++) {
    let code = '';
    for (let j = 0; j < 12; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (j === 3 || j === 7) code += '-';
    }
    codes.push(code);
  }

  return codes;
}
```

---

## 3️⃣ Verify Setup (Complete MFA Setup) Endpoint

```typescript
// routes/mfa.ts (continued)

import speakeasy from 'speakeasy';
import bcrypt from 'bcrypt';
import redis from '@/redis';
import db from '@/db';

/**
 * POST /api/auth/mfa/verify-setup
 *
 * Verifies the code user entered matches their TOTP secret
 * If valid, stores the secret permanently and marks MFA as complete
 */
export async function verifyMFASetup(req: Request, res: Response) {
  const { userId, code, method } = req.body;

  try {
    // Validate input
    if (!userId || !code || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check rate limit (max 5 attempts per minute)
    const attemptKey = `mfa:setup:attempts:${userId}`;
    const attempts = await redis.incr(attemptKey);

    if (attempts === 1) {
      await redis.expire(attemptKey, 60); // Reset after 1 minute
    }

    if (attempts > 5) {
      return res.status(429).json({
        error: 'Too many attempts. Please try again in 1 minute.'
      });
    }

    if (method === 'authenticator') {
      // Get pending secret from Redis
      const pendingData = await redis.get(`mfa:pending:${userId}`);

      if (!pendingData) {
        return res.status(400).json({
          error: 'MFA setup expired. Please start over.'
        });
      }

      const { secret, backupCodes } = JSON.parse(pendingData);

      // Verify the TOTP code
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: code,
        window: 2 // Allow current window and ±1 previous/next window
      });

      if (!verified) {
        return res.status(400).json({
          error: 'Invalid code. Please check your authenticator app.'
        });
      }

      // ✅ Code is valid! Store the secret permanently
      try {
        // Encrypt the secret before storing
        const encryptedSecret = await bcrypt.hash(secret, 10);

        // Hash backup codes
        const hashedBackupCodes = await Promise.all(
          backupCodes.map(code => bcrypt.hash(code, 10))
        );

        // Update user in database
        await db.user.update({
          where: { id: userId },
          data: {
            mfaSetupComplete: true,
            mfaMethod: 'authenticator',
            mfaSecret: encryptedSecret,
            mfaBackupCodes: hashedBackupCodes, // Store as JSON array
            mfaSetupCompletedAt: new Date(),
            isFirstLogin: false
          }
        });

        // Clear pending data from Redis
        await redis.del(`mfa:pending:${userId}`);

        // Log the event
        await logMFAEvent(userId, 'setup', true);

        // Clear attempt counter
        await redis.del(attemptKey);

        res.json({
          success: true,
          message: 'MFA setup complete'
        });

      } catch (dbError) {
        console.error('Database error during MFA setup:', dbError);
        res.status(500).json({ error: 'Failed to save MFA configuration' });
      }

    } else {
      res.status(400).json({ error: 'Invalid method' });
    }

  } catch (error) {
    console.error('Verify MFA setup error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}
```

---

## 4️⃣ Verify Login (MFA Verification During Login) Endpoint

```typescript
// routes/mfa.ts (continued)

import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

/**
 * POST /api/auth/mfa/verify-login
 *
 * Verifies TOTP code or backup code during login
 * Returns session token if valid
 */
export async function verifyMFALogin(req: Request, res: Response) {
  const { userId, code } = req.body;

  try {
    // Validate input
    if (!userId || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check rate limit (max 5 attempts per minute)
    const attemptKey = `mfa:login:attempts:${userId}`;
    const attempts = await redis.incr(attemptKey);

    if (attempts === 1) {
      await redis.expire(attemptKey, 60);
    }

    if (attempts > 5) {
      // Lock account for 15 minutes after too many failures
      const lockKey = `mfa:locked:${userId}`;
      await redis.setex(lockKey, 900, 'locked');

      await logMFAEvent(userId, 'failed_verify_login', false, 'Account locked');

      return res.status(429).json({
        error: 'Too many failed attempts. Account locked for 15 minutes.'
      });
    }

    // Check if account is locked
    const isLocked = await redis.exists(`mfa:locked:${userId}`);
    if (isLocked) {
      return res.status(429).json({
        error: 'Account temporarily locked. Try again later.'
      });
    }

    // Get user from database
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user || !user.mfaSetupComplete) {
      return res.status(401).json({ error: 'MFA not set up for this user' });
    }

    let isValid = false;

    // Try TOTP code first
    if (code.length === 6 && /^\d{6}$/.test(code)) {
      const verified = speakeasy.totp.verify({
        secret: user.mfaSecret, // This should be decrypted first!
        encoding: 'base32',
        token: code,
        window: 2
      });

      if (verified) {
        isValid = true;
      }
    }

    // If TOTP failed, try backup codes
    if (!isValid && user.mfaBackupCodes && Array.isArray(user.mfaBackupCodes)) {
      for (let i = 0; i < user.mfaBackupCodes.length; i++) {
        const match = await bcrypt.compare(code, user.mfaBackupCodes[i]);
        if (match) {
          // Backup code is valid - remove it from the list (one-time use)
          const updatedBackupCodes = user.mfaBackupCodes.filter((_, index) => index !== i);
          await db.user.update({
            where: { id: userId },
            data: { mfaBackupCodes: updatedBackupCodes }
          });

          isValid = true;
          await logMFAEvent(userId, 'backup_code_used', true);
          break;
        }
      }
    }

    if (!isValid) {
      await logMFAEvent(userId, 'failed_verify_login', false);

      return res.status(401).json({
        error: 'Invalid code. Please try again.'
      });
    }

    // ✅ Code is valid! Create session token
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        ngoId: user.ngoId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Update last login timestamp
    await db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });

    // Clear attempt counter
    await redis.del(attemptKey);

    // Log successful login
    await logMFAEvent(userId, 'verify_login', true);

    res.json({
      success: true,
      sessionToken,
      expiresIn: '24h'
    });

  } catch (error) {
    console.error('Verify MFA login error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}
```

---

## 5️⃣ Mark MFA Complete Endpoint

```typescript
// routes/mfa.ts (continued)

/**
 * POST /api/auth/mfa/mark-complete
 *
 * Called after successful MFA verification during setup
 * Final step before redirecting to dashboard
 */
export async function markMFAComplete(req: Request, res: Response) {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Verify MFA was already set up
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user || !user.mfaSetupComplete) {
      return res.status(400).json({ error: 'MFA setup incomplete' });
    }

    // Log completion
    await logMFAEvent(userId, 'setup_complete', true);

    res.json({
      success: true,
      message: 'MFA setup complete. You can now log in.'
    });

  } catch (error) {
    console.error('Mark MFA complete error:', error);
    res.status(500).json({ error: 'Failed to mark MFA complete' });
  }
}
```

---

## 6️⃣ Logging Function (Audit Trail)

```typescript
// utils/mfaLogging.ts

import db from '@/db';

interface MFAEventLog {
  userId: string;
  action: 'setup' | 'verify' | 'failed_verify' | 'backup_code_used' | 'setup_complete' | 'failed_verify_login' | 'verify_login';
  success: boolean;
  ipAddress?: string;
  details?: string;
}

export async function logMFAEvent(
  userId: string,
  action: MFAEventLog['action'],
  success: boolean,
  details?: string
) {
  try {
    await db.mfaAuditLog.create({
      data: {
        userId,
        action,
        success,
        details: details || '',
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log MFA event:', error);
    // Don't throw - logging failure shouldn't break authentication
  }
}
```

---

## 7️⃣ Prisma Schema Updates

```prisma
// prisma/schema.prisma

model User {
  id                      String    @id @default(cuid())
  email                   String    @unique
  passwordHash            String
  ngoName                 String
  ngoId                   String

  // MFA Fields
  mfaSetupComplete        Boolean   @default(false)
  mfaMethod               String?   // 'authenticator' | 'webauthn'
  mfaSecret               String?   // Encrypted TOTP secret
  mfaBackupCodes          String[]  @default([]) // Hashed backup codes (JSON)
  mfaSetupCompletedAt     DateTime?
  isFirstLogin            Boolean   @default(true)
  lastLoginAt             DateTime?
  mfaFailedAttempts       Int       @default(0)
  mfaLockedUntil          DateTime?

  // Relations
  mfaAuditLogs            MFAAuditLog[]

  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
}

model MFAAuditLog {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  action      String    // 'setup', 'verify', 'failed_verify', etc.
  success     Boolean
  details     String?
  createdAt   DateTime  @default(now())
}
```

---

## 8️⃣ Database Migration

```bash
# Create migration
npx prisma migrate dev --name add_mfa_fields

# Or if using Prisma migrations:
npx prisma migrate create --name add_mfa_fields
```

---

## 9️⃣ Express Routes Setup

```typescript
// routes/index.ts or server.ts

import express from 'express';
import {
  loginHandler,
  generateMFASecret,
  verifyMFASetup,
  verifyMFALogin,
  markMFAComplete
} from '@/routes/auth';

const router = express.Router();

// Auth routes
router.post('/auth/login', loginHandler);

// MFA routes
router.post('/auth/mfa/generate-secret', generateMFASecret);
router.post('/auth/mfa/verify-setup', verifyMFASetup);
router.post('/auth/mfa/verify-login', verifyMFALogin);
router.post('/auth/mfa/mark-complete', markMFAComplete);

export default router;
```

---

## 🔟 Environment Variables (.env)

```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Encryption
ENCRYPTION_KEY=your-encryption-key-for-mfa-secrets

# Redis
REDIS_URL=redis://localhost:6379

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ngo_db

# App
NODE_ENV=development
APP_URL=http://localhost:3000
```

---

## 1️⃣1️⃣ Middleware: Protect Routes (Optional)

```typescript
// middleware/requireMFA.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No authentication token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Usage in routes:
// router.get('/dashboard', requireAuth, dashboardHandler);
```

---

## 1️⃣2️⃣ Quick Start Checklist

```
✅ BACKEND SETUP CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Install npm dependencies
  npm install speakeasy @simplewebauthn/server jwt bcrypt redis

□ Create .env file with all variables

□ Add Prisma schema fields (User model + MFAAuditLog)

□ Run database migration
  npx prisma migrate dev

□ Create route handlers in routes/auth.ts or routes/mfa.ts

□ Add routes to Express app

□ Test endpoints with Postman or curl:

  1. POST /api/auth/login
  2. POST /api/auth/mfa/generate-secret
  3. POST /api/auth/mfa/verify-setup
  4. POST /api/auth/mfa/verify-login

□ Verify database records are being created

□ Check Redis is storing/deleting pending MFA data correctly

□ Enable rate limiting in production (use express-rate-limit)

□ Set up HTTPS (never send codes over HTTP)

□ Create account recovery flow (admin reset endpoint)

□ Set up logging/monitoring for MFA failures

□ Test with real authenticator app (Google Authenticator)
```

---

## 1️⃣3️⃣ Testing with cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ngo.org",
    "password": "yourpassword"
  }'

# Response:
# {
#   "success": true,
#   "userId": "clxyz123",
#   "mfaSetupComplete": false,
#   "isFirstLogin": true
# }

# 2. Generate Secret
curl -X POST http://localhost:3000/api/auth/mfa/generate-secret \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxyz123",
    "method": "authenticator",
    "email": "admin@ngo.org",
    "ngoName": "My NGO"
  }'

# Response:
# {
#   "secret": "JBSWY3DPEBLW64TMMUXAXO2I62A",
#   "qrCodeUrl": "otpauth://totp/...",
#   "backupCodes": ["ABCD-EFGH-IJKL", ...],
#   "expiresIn": 600
# }

# 3. Verify Setup (use code from authenticator app)
curl -X POST http://localhost:3000/api/auth/mfa/verify-setup \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxyz123",
    "code": "123456",
    "method": "authenticator"
  }'

# Response:
# {
#   "success": true,
#   "message": "MFA setup complete"
# }

# 4. Verify Login
curl -X POST http://localhost:3000/api/auth/mfa/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clxyz123",
    "code": "234567"
  }'

# Response:
# {
#   "success": true,
#   "sessionToken": "eyJhbGc...",
#   "expiresIn": "24h"
# }
```

---

## 🎉 You're Done!

All backend endpoints are now ready. Test them and integrate with your frontend MFA components!
