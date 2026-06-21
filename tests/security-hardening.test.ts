import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function read(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

const chatCreateRoute = read('app/api/chat/create/route.ts');
assert.match(chatCreateRoute, /status:\s*'PENDING'/);
assert.doesNotMatch(chatCreateRoute, /update:\s*\{\s*status:\s*'ACCEPTED'/);

const chatSendRoute = read('app/api/chat/send/route.ts');
assert.match(chatSendRoute, /conversation\.status\s*===\s*'PENDING'/);

const uploadRoute = read('app/api/requests/upload-image/route.ts');
assert.match(uploadRoute, /process\.env\.NODE_ENV\s*===\s*'production'/);
assert.match(uploadRoute, /Image storage is temporarily unavailable/);

const donationsRoute = read('app/api/donations/route.ts');
assert.match(donationsRoute, /getServerSession\(authOptions\)/);
assert.match(donationsRoute, /donorId:\s*session\.user\.id/);
assert.doesNotMatch(donationsRoute, /const\s*\{[\s\S]*donorId[\s\S]*\}\s*=\s*await req\.json\(\)/);

console.log('security hardening test OK');
