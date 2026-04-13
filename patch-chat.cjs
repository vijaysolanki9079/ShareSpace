const fs = require('fs');
const content = fs.readFileSync('server/routers/chat.ts', 'utf8');
const patched = content.replace('let record;', 'let record: { publicKey: string | null; encryptedPrivateKey: string | null; keyDerivationSalt: string | null; } | null = null;');
fs.writeFileSync('server/routers/chat.ts', patched);
