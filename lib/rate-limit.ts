import { NextResponse } from 'next/server';

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
};

type RateLimitGlobal = typeof globalThis & {
  rateLimitBuckets?: Map<string, Bucket>;
};

const globalForRateLimit = globalThis as RateLimitGlobal;
const buckets = globalForRateLimit.rateLimitBuckets ?? new Map<string, Bucket>();
globalForRateLimit.rateLimitBuckets = buckets;

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || headers.get('x-real-ip') || 'local';
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfter: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    retryAfter: 0,
  };
}

export function checkRequestRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
  identifier?: string
) {
  const ip = getClientIp(request.headers);
  return checkRateLimit(`${scope}:${identifier ?? ip}`, limit, windowMs);
}

export async function checkRateLimitShared(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const { prisma } = await import('@/lib/prisma');
    const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
      VALUES (${key}, 1, ${resetAt}, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
          ELSE "RateLimitBucket"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${resetAt}
          ELSE "RateLimitBucket"."resetAt"
        END,
        "updatedAt" = ${now}
      RETURNING "count", "resetAt"
    `;

    const bucket = rows[0];
    if (!bucket) return checkRateLimit(key, limit, windowMs);

    const retryAfter = Math.max(0, Math.ceil((bucket.resetAt.getTime() - now.getTime()) / 1000));
    return {
      allowed: bucket.count <= limit,
      limit,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt.getTime(),
      retryAfter: bucket.count <= limit ? 0 : retryAfter,
    };
  } catch (error) {
    console.error('[rate-limit] Shared limiter unavailable; using in-memory fallback:', error);
    return checkRateLimit(key, limit, windowMs);
  }
}

export async function checkRequestRateLimitShared(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
  identifier?: string
) {
  const ip = getClientIp(request.headers);
  return checkRateLimitShared(`${scope}:${identifier ?? ip}`, limit, windowMs);
}

export function rateLimitResponse(result: RateLimitResult) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again shortly.' },
    {
      status: 429,
      headers: {
        'Retry-After': result.retryAfter.toString(),
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
      },
    }
  );
}
