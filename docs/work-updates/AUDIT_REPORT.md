# ShareSpace Repository - Comprehensive Code Audit Report

**Audit Date:** April 12, 2026
**Scope:** Full codebase analysis including TypeScript/TSX files, API routes, database schema, authentication logic, and configuration files.

---

## Executive Summary

This audit identified **23 distinct issues** across the ShareSpace codebase, including:
- **5 Critical** security vulnerabilities
- **6 High** severity issues requiring immediate attention
- **7 Medium** severity code quality concerns
- **5 Low** severity improvements

**Critical Issues Found:**
1. Unencrypted NGO passwords in tRPC register procedure
2. Unauthenticated analytics API exposing sensitive data
3. Unauthenticated donations API GET endpoint
4. Unvalidated donation creator parameter in POST endpoint
5. Sensitive error details exposed in API responses

---

## CRITICAL ISSUES

### 1. **Unencrypted NGO Passwords in Production**

**File:** [server/routers/ngo.ts](server/routers/ngo.ts#L103)
**Line:** 103
**Severity:** CRITICAL
**Type:** Security - Authentication

**Problem:**
```typescript
password: input.password, // TODO: Hash this properly with bcrypt
```

Passwords are stored in plaintext in the NGO registration procedure. This violates fundamental security practices and exposes all NGO accounts to compromise.

**Impact:**
- All NGO passwords are readable in database
- Any database breach exposes NGO credentials
- Violates data protection regulations (GDPR, DPDPA)
- Users can access their accounts with stolen credentials

**Suggested Fix:**
```typescript
import bcrypt from 'bcryptjs';

// In register mutation:
const hashedPassword = await bcrypt.hash(input.password, 10);

const ngo = await prisma.nGO.create({
  data: {
    // ... other fields
    password: hashedPassword, // Hash with bcrypt
    // ...
  },
});
```

---

### 2. **Unauthenticated Analytics API Exposes Sensitive Data**

**File:** [app/api/analytics/route.ts](app/api/analytics/route.ts#L1-L106)
**Line:** 1-106
**Severity:** CRITICAL
**Type:** Security - Authorization/Information Disclosure

**Problem:**
The GET endpoint has no authentication check and exposes:
- Top donors with real names and emails
- NGO performance metrics
- Donation statistics with user identifiable information
- 30-day activity patterns

```typescript
export async function GET(_req: NextRequest) {
  try {
    // NO AUTHENTICATION CHECK - anyone can access this data
    const topDonors = await query<...>(`SELECT u.id, u."fullName", u.email, ...`);
    // ... exposes user emails and donation patterns
```

**Impact:**
- Donors' identities and emails exposed to public
- NGO performance data leaks
- Pattern analysis enables social engineering
- Violates user privacy
- Enables scraping of user directory

**Suggested Fix:**
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Only allow admin users to view analytics
  if (!session || (session.user as any).type !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    // ... rest of analytics logic
```

---

### 3. **Unauthenticated Donations API GET Endpoint**

**File:** [app/api/donations/route.ts](app/api/donations/route.ts#L5)
**Line:** 5-70
**Severity:** CRITICAL
**Type:** Security - Authorization

**Problem:**
```typescript
export async function GET(req: NextRequest) {
  try {
    // NO AUTHENTICATION CHECK - anyone can fetch all donations
    const donations = await prisma.donation.findMany({
      where: {
        ...(status && { status }),
        ...(category && { category }),
      },
      include: {
        donor: {
          select: {
            id: true,
            fullName: true,
            email: true,  // EXPOSED
            image: true,
          },
        },
        // ...
```

**Impact:**
- All donations are publicly visible with donor information
- Donor identities and emails exposed
- Enables targeted attacks on donors
- No access control on sensitive donation data
- Violates user privacy

**Suggested Fix:**
Add authentication and authorization:
```typescript
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Only allow users to see donations relevant to them
  const whereClause = {
    ...(status && { status }),
    ...(category && { category }),
  };

  // If not admin, restrict to own donations
  if (session.user.type !== 'admin') {
    whereClause.donorId = session.user.id;
  }

  const donations = await prisma.donation.findMany({
    where: whereClause,
    // ...
```

---

### 4. **Unvalidated Donation Creator Parameter**

**File:** [app/api/donations/route.ts](app/api/donations/route.ts#L78)
**Line:** 78-102
**Severity:** CRITICAL
**Type:** Security - Authorization/Privilege Escalation

**Problem:**
```typescript
export async function POST(req: NextRequest) {
  try {
    const { title, description, category, image, donorId } = await req.json();

    // NO VALIDATION - client can specify any donorId
    if (!title || !category || !donorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        title,
        description,
        category,
        image,
        donorId, // ACCEPTS ANY DONOR ID FROM CLIENT!
        status: "pending",
      },
```

**Attack Scenario:**
1. User A creates a donation and gets user A's token
2. User A calls POST /api/donations with `donorId: "user-B-id"`
3. System creates donation attributed to User B
4. User B's account appears to have donated something they didn't

**Impact:**
- Privilege escalation: users can create donations on behalf of others
- Account impersonation
- Manipulation of donation statistics
- Fraudulent activity attribution

**Suggested Fix:**
```typescript
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { title, description, category, image } = await req.json();

  if (!title || !category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // ALWAYS use session user ID, never accept from client
  const donation = await prisma.donation.create({
    data: {
      title,
      description,
      category,
      image,
      donorId: session.user.id, // Use authenticated user ID only
      status: "pending",
    },
```

---

### 5. **Sensitive Error Details Exposed in API Responses**

**File:** [app/api/auth/signup/route.ts](app/api/auth/signup/route.ts#L63)
**Line:** 63
**Severity:** CRITICAL
**Type:** Security - Information Disclosure

**Problem:**
```typescript
catch (error: unknown) {
  console.error("Signup error:", error);
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    { error: "Internal server error", details: message },  // EXPOSES DETAILS!
    { status: 500 }
  );
}
```

**Attack Scenario:**
1. Attacker sends malformed requests to trigger errors
2. Error messages reveal database structure, table names, column names
3. Attacker gains intelligence for targeted SQL injection

Example error response:
```json
{
  "error": "Internal server error",
  "details": "relation \"User\" does not exist"  // Reveals table structure
}
```

**Impact:**
- Information disclosure about system internals
- Enables reconnaissance for SQL injection attacks
- Reveals database structure to attackers

**Suggested Fix:**
```typescript
catch (error: unknown) {
  console.error("Signup error:", error);

  // Log full error server-side, but don't expose to client
  if (error instanceof Error && error.message.includes('database')) {
    // This is already logged to console.error above
    console.error("Database error details:", error);
  }

  // Send generic message to client
  return NextResponse.json(
    { error: "Signup failed. Please try again later." },
    { status: 500 }
  );
}
```

---

## HIGH SEVERITY ISSUES

### 6. **NGO Signup Handler Doesn't Hash Passwords**

**File:** [app/api/auth/ngo-signup/route.ts](app/api/auth/ngo-signup/route.ts#L45)
**Line:** 45
**Severity:** HIGH
**Type:** Security - Authentication

**Problem:**
While this route DOES hash the password (unlike the tRPC procedure), there's inconsistency in the codebase - some paths hash, some don't.

```typescript
const hashedPassword = await bcrypt.hash(password, 10);  // Good
```

But the tRPC register procedure (line 103 in server/routers/ngo.ts) doesn't, creating two paths to NGO registration with different security levels.

**Impact:**
- Dual registration paths with inconsistent security
- Developers might copy insecure path from tRPC router
- Maintenance burden

**Suggested Fix:**
Fix the tRPC router to hash passwords (see Issue #1).

---

### 7. **Settings API Missing User Type Validation**

**File:** [app/api/user/settings/route.ts](app/api/user/settings/route.ts#L1-L50)
**Line:** 1-50
**Severity:** HIGH
**Type:** Security - Authorization

**Problem:**
```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fullName, bio, location, image } = await req.json();
  const userId = session.user.id;
  const userType = (session.user as any).type || 'user';  // Defaults to 'user'!

  if (userType === 'ngo') {
    // Update NGO
  } else {
    // Update User
  }
```

**Issue:**
- Uses `|| 'user'` default, so any user without explicit type gets user access
- Doesn't validate that the type is actually set
- Could allow NGO users to update user profile fields or vice versa

**Attack Scenario:**
1. NGO user's session gets corrupted and loses type field
2. Defaults to 'user' type
3. Can now update user profile instead of NGO profile
4. Cross-type data manipulation

**Suggested Fix:**
```typescript
const userType = (session.user as any).type;

// Strict validation - no defaults
if (!userType || (userType !== 'ngo' && userType !== 'user')) {
  return NextResponse.json(
    { error: 'Invalid user type in session' },
    { status: 400 }
  );
}

// Ensure user ID matches the record they're updating
if (userType === 'user') {
  // Verify user exists and matches session
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
  // ... update logic
}
```

---

### 8. **NGO Verification Document Access Not Authenticated**

**File:** [server/routers/ngo.ts](server/routers/ngo.ts#L265)
**Line:** 265
**Severity:** HIGH
**Type:** Security - Authorization

**Problem:**
```typescript
getSubmittedDocuments: publicProcedure
  .input(z.object({ ngoId: z.string() }))
  .query(async ({ input }) => {
    const docs = await prisma.nGOVerificationDocument.findMany({
      where: { ngoId: input.ngoId },
      orderBy: { uploadedAt: 'desc' },
    });
```

Using `publicProcedure` means anyone can query any NGO's verification documents including:
- Pan card scans
- Bank account details
- Address proofs
- Identification documents

**Impact:**
- PII (Personally Identifiable Information) exposure
- Can be used for identity theft
- Violates privacy regulations
- Document forgery risks

**Suggested Fix:**
```typescript
// Create a protected procedure macro
const protectedProcedure = publicProcedure.use(async (opts) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: { ...opts.ctx, userId: session.user.id },
  });
});

getSubmittedDocuments: protectedProcedure
  .input(z.object({ ngoId: z.string() }))
  .query(async ({ input, ctx }) => {
    // Only allow NGO to view their own documents
    const ngo = await prisma.nGO.findUnique({
      where: { id: input.ngoId },
    });

    if (ngo?.id !== ctx.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot access other NGO documents',
      });
    }

    const docs = await prisma.nGOVerificationDocument.findMany({
      where: { ngoId: input.ngoId },
      orderBy: { uploadedAt: 'desc' },
    });
```

---

### 9. **Donations Bulk Update API Missing Authentication**

**File:** [app/api/analytics/route.ts](app/api/analytics/route.ts#L108)
**Line:** 108-145
**Severity:** HIGH
**Type:** Security - Authorization

**Problem:**
```typescript
export async function POST(req: NextRequest) {
  try {
    const { donationIds, newStatus, ngoId } = await req.json();

    // NO AUTHENTICATION CHECK - anyone can bulk update donations!
    const _results = await transaction([
      {
        sql: `UPDATE "Donation"
              SET status = $1, "ngoId" = $2, "updatedAt" = NOW()
              WHERE id = ANY($3)`,
        params: [newStatus, ngoId, donationIds],
      },
```

**Impact:**
- Attacker can reassign donations to different NGOs
- Can change donation status (pending → delivered → etc.)
- Can manipulate donation statistics
- No audit trail of who made changes

**Suggested Fix:**
Add authentication and authorization checks:
```typescript
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.type !== 'ngo') {
    return NextResponse.json(
      { error: 'Only NGOs can update donations' },
      { status: 403 }
    );
  }

  const { donationIds, newStatus, ngoId } = await req.json();

  // Verify the NGO ID matches the session user
  if (ngoId !== session.user.id) {
    return NextResponse.json(
      { error: 'Cannot update donations for other NGOs' },
      { status: 403 }
    );
  }

  // Validate status is one of allowed values
  const allowedStatuses = ['pending', 'accepted', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(newStatus)) {
    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    );
  }

  try {
    const _results = await transaction([
      // ... rest of transaction
```

---

### 10. **Database Connection Could Exhaust in Serverless**

**File:** [lib/server-db.ts](lib/server-db.ts#L1-L42)
**Line:** 20-30
**Severity:** HIGH
**Type:** Performance - Scalability

**Problem:**
```typescript
pool = new Pool({
  connectionString: getConnectionString(),
  ssl: rejectUnauthorized ? { rejectUnauthorized: true } : false,
  max: 20,  // Max 20 connections - low for production serverless
  idleTimeoutMillis: 30000,  // 30 second idle timeout
  connectionTimeoutMillis: 2000,  // 2 second connection timeout
});
```

With `max: 20` connections in a serverless environment where many cold starts can happen simultaneously, connection pool exhaustion is likely.

**Impact:**
- Under high load, new requests cannot get DB connections
- "Too many clients" errors
- Cascading failures
- Poor user experience

**Suggested Fix:**
```typescript
pool = new Pool({
  connectionString: getConnectionString(),
  ssl: rejectUnauthorized ? { rejectUnauthorized: true } : false,
  max: process.env.NODE_ENV === 'production' ? 50 : 20,

  // Shorter idle timeout in production to free connections
  idleTimeoutMillis: process.env.NODE_ENV === 'production' ? 10000 : 30000,

  // Connection timeout should be higher to allow for cold starts
  connectionTimeoutMillis: process.env.NODE_ENV === 'production' ? 5000 : 2000,

  // Set statement timeout to prevent long-running queries
  statement_timeout: 30000,  // 30 seconds

  // Keep alive probes
  keepalives: true,
  keepalives_idle: 10,
});
```

Or better yet, use Prisma's connection pooling with PgBouncer in production.

---

### 11. **NGO Search Procedure Public Without Rate Limiting**

**File:** [server/routers/ngo.ts](server/routers/ngo.ts#L47)
**Line:** 47-62
**Severity:** HIGH
**Type:** Security - Denial of Service

**Problem:**
```typescript
search: publicProcedure
  .input(
    z.object({
      lat:         z.number().min(-90).max(90).nullable().optional(),
      lng:         z.number().min(-180).max(180).nullable().optional(),
      radiusKm:    z.number().min(1).max(500).default(50),
      // ...
    })
  )
  .query(async ({ input }) => {
```

- No rate limiting on this public endpoint
- Can perform expensive PostGIS queries with arbitrary radius
- ST_DistanceSphere queries can be slow without proper indexes
- Any client can spam requests

**Attack Scenario:**
1. Attacker calls search with radius: 500 km
2. Sends 1000 requests per second
3. Database gets overwhelmed
4. Service becomes unavailable

**Impact:**
- Denial of service vulnerability
- Database resource exhaustion
- Service degradation for legitimate users

**Suggested Fix:**
Implement rate limiting middleware:
```typescript
// Create rate limiting middleware
import { Ratelimit } from '@upstash/ratelimit'; // or similar

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

search: publicProcedure
  .input(...)
  .query(async ({ input, ctx }) => {
    // Get client IP from headers
    const ip = ctx.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many search requests. Please try again later.',
      });
    }

    const ngos = await findNearbyNGOs({...});
    return ngos;
  }),
```

---

## MEDIUM SEVERITY ISSUES

### 12. **Excessive Use of `any` Type**

**Files:**
- [lib/auth.ts](lib/auth.ts#L1) - Line 1, 117, 131
- [lib/server-db.ts](lib/server-db.ts#L1) - Line 1
- [server/routers/search.ts](server/routers/search.ts#L1) - Line 1, 91
- [app/api/user/settings/route.ts](app/api/user/settings/route.ts#L1)
- [components/dashboard/MyRequests.tsx](components/dashboard/MyRequests.tsx#L1)
- [components/dashboard/Settings.tsx](components/dashboard/Settings.tsx#L1)

**Severity:** MEDIUM
**Type:** Code Quality - Type Safety

**Problem:**
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */  // Disables all eslint checks

token.type = (user as any).type;  // Casting to any loses type safety
(session.user as any).bio = token.bio;  // No type checking

export async function query<T = any>(  // Generic default is any
  sql: string,
  params?: any[]  // Any array type
): Promise<{ rows: T[]; rowCount: number | null }>
```

**Impact:**
- Loses type safety benefits of TypeScript
- Runtime errors not caught at compile time
- Difficult to refactor
- Harder to maintain

Example problem that would have been caught:
```typescript
// This compiles but fails at runtime
const result = (someObject as any).nonexistentField;  // No error!

// Proper typing would catch this:
if ('field' in obj) {
  // Safe access
}
```

**Suggested Fix:**
Replace `any` with proper types:
```typescript
// Instead of:
export async function query<T = any>(sql: string, params?: any[])

// Use:
export async function query<T>(
  sql: string,
  params?: (string | number | boolean | null | undefined)[]
): Promise<{ rows: T[]; rowCount: number | null }>

// Create proper types for user session:
interface UserSession extends DefaultSession {
  user?: DefaultSession['user'] & {
    id: string;
    type: 'user' | 'ngo';
    bio?: string;
    location?: string;
  };
}
```

---

### 13. **Location Search API Timeout Configuration**

**File:** [server/routers/search.ts](server/routers/search.ts#L13)
**Line:** 13-14
**Severity:** MEDIUM
**Type:** Performance - Stability

**Problem:**
```typescript
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';
const API_TIMEOUT = 5000; // 5 seconds timeout
```

5 seconds is tight for an external API call. Network issues or API slow response can cause timeouts.

**Impact:**
- User location search fails intermittently
- Poor user experience
- Retry storms possible

**Suggested Fix:**
```typescript
const API_TIMEOUT = 10000; // 10 seconds - more reasonable for external API

// Add retry logic:
async function fetchWithRetry(
  url: string,
  options: any,
  maxRetries = 2
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

### 14. **No CORS Headers Configuration**

**File:** [app/api/**/*.ts](app/api)
**Severity:** MEDIUM
**Type:** Security - Configuration

**Problem:**
No explicit CORS headers are set in API responses. This means either:
1. CORS is unrestricted (security issue)
2. CORS is using Next.js defaults (may be too restrictive)

Example: If external clients need to call these APIs (like a mobile app or third-party integration), CORS issues may occur.

**Suggested Fix:**
Create a CORS middleware wrapper:
```typescript
// lib/cors.ts
export function setCORSHeaders(response: NextResponse, origin?: string) {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://sharespace.com',
    // Add production domains
  ];

  const requestOrigin = origin || '*';
  const isAllowed = allowedOrigins.includes(requestOrigin) ||
    requestOrigin === '*';

  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', requestOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

// Use in each API route:
export async function GET(req: NextRequest) {
  // ... logic
  const response = NextResponse.json(data);
  return setCORSHeaders(response);
}
```

---

### 15. **Password Validation Too Weak**

**File:** [lib/validation.ts](lib/validation.ts#L1-L35)
**Line:** 6
**Severity:** MEDIUM
**Type:** Security - Password Policy

**Problem:**
```typescript
password: z.string().min(8, 'Password must be at least 8 characters'),
```

Only checks minimum length. No complexity requirements:
- No uppercase letters required
- No numbers required
- No special characters required
- "password" would be accepted: 8 characters but extremely weak

**Impact:**
- Users can choose weak passwords like "pass1234"
- Easier to brute force
- Below security best practices

**Suggested Fix:**
```typescript
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*]/, 'Password must contain at least one special character');

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});
```

---

### 16. **Search Results Missing Pagination Limits**

**File:** [lib/repositories/ngo.ts](lib/repositories/ngo.ts#L1-L150)
**Line:** 130-133
**Severity:** MEDIUM
**Type:** Performance - Query Optimization

**Problem:**
```typescript
const sql = `
  SELECT
    id,
    "organizationName",
    // ...
  FROM "NGO"
  ${where}
  ${orderBy}
  LIMIT 100  // Fixed limit, no pagination support
`;
```

Only returns 100 results, no offset/pagination. If there are more than 100 NGOs in a search radius, results are incomplete. No way for client to get page 2, 3, etc.

**Impact:**
- Users can't see all results
- Wasted database query results
- Poor search experience if many NGOs match

**Suggested Fix:**
```typescript
export async function findNearbyNGOs({
  lat,
  lng,
  radiusKm = 50,
  category,
  searchQuery,
  limit = 50,  // Add limit parameter
  offset = 0,  // Add offset for pagination
}: FindNearbyNGOsOptions & { limit?: number; offset?: number }): Promise<NearbyNGO[]> {
  // ... validation and param building

  const sql = `
    SELECT
      id,
      "organizationName",
      // ...
    FROM "NGO"
    ${where}
    ${orderBy}
    LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
  `;

  params.push(Math.min(limit, 100));  // Cap at 100
  params.push(offset);

  const result = await query<NearbyNGO>(sql, params);
  return result.rows;
}
```

---

### 17. **NGO Verification Status Transitions Not Validated**

**File:** [server/routers/ngo.ts](server/routers/ngo.ts#L90-L110)
**Line:** 90-110
**Severity:** MEDIUM
**Type:** Data Integrity - State Management

**Problem:**
NGO can be created with `verificationStatus: 'pending'` but there's no validation that status transitions are valid:
- Can a 'verified' NGO go back to 'pending'?
- Can status go from 'rejected' to 'pending'?
- No audit trail of status changes

```typescript
const ngo = await prisma.nGO.create({
  data: {
    // ...
    verificationStatus: 'pending',
    // Can update to any value later without validation
  },
});
```

**Impact:**
- Invalid state transitions possible
- NGO could appear verified then unverified
- No audit trail for compliance
- Difficult to debug state issues

**Suggested Fix:**
```typescript
// Define valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  'pending': ['approved', 'rejected'],
  'approved': ['rejected', 'verified'],  // After manual approval
  'rejected': ['pending'],  // Can resubmit
  'verified': [],  // Terminal state (or allow revocation)
};

// Create enum for type safety
enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  VERIFIED = 'verified',
}

// Validate transitions
function isValidTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

// Use in updates
async function updateVerificationStatus(
  ngoId: string,
  newStatus: VerificationStatus,
  reason?: string
) {
  const ngo = await prisma.nGO.findUnique({
    where: { id: ngoId },
  });

  if (!ngo) throw new Error('NGO not found');

  if (!isValidTransition(ngo.verificationStatus, newStatus)) {
    throw new Error(
      `Invalid transition from ${ngo.verificationStatus} to ${newStatus}`
    );
  }

  // Log status change for audit
  await prisma.nGOStatusHistory.create({
    data: {
      ngoId,
      fromStatus: ngo.verificationStatus,
      toStatus: newStatus,
      reason,
      changedAt: new Date(),
    },
  });

  return await prisma.nGO.update({
    where: { id: ngoId },
    data: { verificationStatus: newStatus },
  });
}
```

---

## LOW SEVERITY ISSUES

### 18. **MapComponent Uses Dynamic Import Without Error Boundary**

**File:** [components/ExploreClient.tsx](components/ExploreClient.tsx#L11-L15)
**Line:** 11-15
**Severity:** LOW
**Type:** Code Quality - Error Handling

**Problem:**
```typescript
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div>Loading Map Layer...</div>
});
```

No error boundary. If map component fails to load, whole page could crash.

**Suggested Fix:**
```typescript
const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  {
    ssr: false,
    loading: () => <div className="w-full h-[450px] bg-emerald-50 rounded-3xl animate-pulse" />,
    // Add error boundary
    onError: (error, info) => {
      console.error('Map component failed to load:', error, info);
      return (
        <div className="w-full h-[450px] bg-red-50 rounded-3xl flex items-center justify-center">
          <p className="text-red-600">Failed to load map. Please refresh the page.</p>
        </div>
      );
    },
  }
);
```

---

### 19. **Session Update Not Validated**

**File:** [components/dashboard/Settings.tsx](components/dashboard/Settings.tsx#L60-L63)
**Line:** 60-63
**Severity:** LOW
**Type:** Code Quality - Error Handling

**Problem:**
```typescript
await update({
  name: formData.fullName,
  image: formData.image,
  bio: formData.bio,
  location: formData.location,
});
```

`update()` call doesn't check if it succeeded or handle errors.

**Suggested Fix:**
```typescript
try {
  const result = await update({
    name: formData.fullName,
    image: formData.image,
    bio: formData.bio,
    location: formData.location,
  });

  if (!result?.ok) {
    throw new Error('Failed to update session');
  }

  setMessage('Profile updated successfully!');
} catch (updateError) {
  console.error('Session update failed:', updateError);
  setMessage('Profile saved but session update failed. Please refresh.');
}
```

---

### 20. **No Validation of Numeric Parameters**

**File:** [app/api/donations/route.ts](app/api/donations/route.ts#L8-L10)
**Line:** 8-10
**Severity:** LOW
**Type:** Code Quality - Input Validation

**Problem:**
```typescript
const limit = parseInt(searchParams.get("limit") || "20");
const skip = parseInt(searchParams.get("skip") || "0");
```

No validation of parsed integers:
- Could be negative: `skip: -100`
- Could be extremely large: `limit: 999999999`
- `parseInt("abc")` returns `NaN`, not validated

**Suggested Fix:**
```typescript
const limit = Math.min(
  Math.max(parseInt(searchParams.get("limit") || "20", 10), 1),
  100  // Max 100 per request
);

const skip = Math.max(
  parseInt(searchParams.get("skip") || "0", 10),
  0  // Minimum 0
);

// Validate these are valid numbers
if (isNaN(limit) || isNaN(skip)) {
  return NextResponse.json(
    { error: "Invalid pagination parameters" },
    { status: 400 }
  );
}
```

---

### 21. **Unused Function Parameters in NGO Router**

**File:** [server/routers/ngo.ts](server/routers/ngo.ts#L290-L340)
**Line:** 290-340
**Severity:** LOW
**Type:** Code Quality - Maintainability

**Problem:**
Functions like `formatDocumentLabel` and `getDocumentDescription` referenced but not defined in the file, or defined but parameters not used:

```typescript
.query(async ({ input, ctx }) => {
  // ctx is passed but never used
```

**Suggested Fix:**
Remove unused parameters or implement missing functions:
```typescript
// Remove unused ctx parameter
.query(async ({ input }) => {

// Or if it should be used for logging:
.query(async ({ input, ctx }) => {
  console.log(`User requested documents for NGO: ${input.ngoId}`, {
    headers: ctx.headers.get('user-agent'),
  });
```

---

### 22. **No Logging of Security Events**

**Files:** All API routes
**Severity:** LOW
**Type:** Security - Observability

**Problem:**
Security-relevant events aren't logged:
- Authentication failures
- Authorization denials
- Unusual access patterns
- Bulk operations

```typescript
if (!session || !session.user.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // No log of who tried to access this
}
```

**Suggested Fix:**
```typescript
// Create audit logger
function logSecurityEvent(
  event: 'AUTH_FAILURE' | 'AUTHZ_FAILURE' | 'BULK_OPERATION',
  details: Record<string, any>
) {
  console.warn('[SECURITY]', {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });

  // In production, send to centralized logging (Sentry, LogRocket, etc.)
  if (process.env.NODE_ENV === 'production') {
    sendToLoggingService({ event, details });
  }
}

// Use in routes
if (!session || !session.user.id) {
  logSecurityEvent('AUTH_FAILURE', {
    endpoint: '/api/user/settings',
    ip: req.headers.get('x-forwarded-for'),
  });
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

### 23. **Environment Variable Validation Missing**

**File:** [lib/server-db.ts](lib/server-db.ts#L9-L11)
**Severity:** LOW
**Type:** Configuration - Reliability

**Problem:**
```typescript
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL (or DIRECT_URL) environment variable");
  }

  return connectionString;
}
```

Only checks DATABASE_URL and DIRECT_URL. What about:
- Missing `NEXTAUTH_SECRET` (would cause silent failures)
- Missing `GOOGLE_ID` / `GOOGLE_SECRET`
- Missing other required env vars

**Suggested Fix:**
```typescript
// Create centralized env validation
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'DIRECT_URL',
    'NEXTAUTH_SECRET',
  ];

  const optional = [
    'GOOGLE_ID',
    'GOOGLE_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Warn if optional are missing
  const missingOptional = optional.filter(key => !process.env[key]);
  if (missingOptional.length > 0) {
    console.warn(
      `Missing optional environment variables (some features may not work): ${missingOptional.join(', ')}`
    );
  }
}

// Call at app startup (e.g., in next.config.ts)
validateEnvironment();
```

---

## SUMMARY TABLE

| # | Issue | File | Severity | Type |
|---|-------|------|----------|------|
| 1 | Unencrypted NGO passwords | server/routers/ngo.ts:103 | CRITICAL | Security |
| 2 | Unauthenticated analytics API | app/api/analytics/route.ts:1 | CRITICAL | Security |
| 3 | Unauthenticated donations GET | app/api/donations/route.ts:5 | CRITICAL | Security |
| 4 | Unvalidated donation creator | app/api/donations/route.ts:78 | CRITICAL | Security |
| 5 | Error details exposed | app/api/auth/signup/route.ts:63 | CRITICAL | Security |
| 6 | NGO signup inconsistency | app/api/auth/ngo-signup/route.ts | HIGH | Security |
| 7 | Missing user type validation | app/api/user/settings/route.ts:15 | HIGH | Security |
| 8 | Unprotected verification docs | server/routers/ngo.ts:265 | HIGH | Security |
| 9 | Unauthenticated bulk updates | app/api/analytics/route.ts:108 | HIGH | Security |
| 10 | DB connection pool exhaustion | lib/server-db.ts:20 | HIGH | Performance |
| 11 | No rate limiting on search | server/routers/ngo.ts:47 | HIGH | Security |
| 12 | Excessive `any` types | Multiple | MEDIUM | Code Quality |
| 13 | Timeout too tight | server/routers/search.ts:13 | MEDIUM | Performance |
| 14 | No CORS configuration | app/api/** | MEDIUM | Security |
| 15 | Weak password validation | lib/validation.ts:6 | MEDIUM | Security |
| 16 | No pagination limits | lib/repositories/ngo.ts:130 | MEDIUM | Performance |
| 17 | Status transitions not validated | server/routers/ngo.ts:90 | MEDIUM | Data Integrity |
| 18 | Map dynamic import error handling | components/ExploreClient.tsx:11 | LOW | Code Quality |
| 19 | Session update not validated | components/dashboard/Settings.tsx:60 | LOW | Code Quality |
| 20 | Numeric parameter validation missing | app/api/donations/route.ts:8 | LOW | Code Quality |
| 21 | Unused function parameters | server/routers/ngo.ts:290 | LOW | Code Quality |
| 22 | No security event logging | All API routes | LOW | Observability |
| 23 | Env variable validation missing | lib/server-db.ts:9 | LOW | Configuration |

---

## Recommendations by Priority

### Immediate Actions (Critical - Next 24 hours)
1. Fix NGO password hashing (Issue #1)
2. Add authentication to analytics API (Issue #2)
3. Add authentication to donations GET endpoint (Issue #3)
4. Validate donation creator parameter (Issue #4)
5. Stop exposing error details in responses (Issue #5)

### Urgent (High - Next 1 week)
6. Validate user type in settings API (Issue #7)
7. Protect verification documents endpoint (Issue #8)
8. Add authentication to bulk update API (Issue #9)
9. Add rate limiting to search endpoint (Issue #11)
10. Improve database connection pool configuration (Issue #10)

### Important (Medium - Next 2 weeks)
11. Replace `any` types with proper TypeScript types (Issue #12)
12. Strengthen password validation policy (Issue #15)
13. Add pagination to search results (Issue #16)
14. Implement NGO status transition validation (Issue #17)
15. Add CORS configuration (Issue #14)

### Nice to Have (Low - Next month)
16-23. Code quality improvements and observability enhancements

---

## Conclusion

The ShareSpace codebase has **significant security vulnerabilities** that need immediate attention, particularly around authentication and authorization. The most critical issues are:

1. **Exposed authentication credentials** - NGO passwords stored in plaintext
2. **Unauthenticated sensitive endpoints** - analytics and donations APIs
3. **Privilege escalation** - patients can create donations as any user

These need to be fixed before the application is used in production with real user data. The remaining issues span code quality, performance, and observability improvements that should be addressed in the upcoming sprints.
