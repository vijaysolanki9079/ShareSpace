import assert from 'node:assert/strict';
import { checkRateLimit } from '../lib/rate-limit';

const key = `rate-limit-test:${Date.now()}`;

const first = checkRateLimit(key, 2, 60_000);
assert.equal(first.allowed, true);
assert.equal(first.remaining, 1);

const second = checkRateLimit(key, 2, 60_000);
assert.equal(second.allowed, true);
assert.equal(second.remaining, 0);

const third = checkRateLimit(key, 2, 60_000);
assert.equal(third.allowed, false);
assert.equal(third.remaining, 0);
assert.ok(third.retryAfter > 0);

console.log('rate-limit test OK');
