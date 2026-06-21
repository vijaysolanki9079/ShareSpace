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
