import nacl from 'tweetnacl';

function uint8ArrayToBase64(u8) {
  return Buffer.from(u8).toString('base64');
}

function base64ToUint8Array(b64) {
  return Uint8Array.from(Buffer.from(b64, 'base64'));
}

const key = nacl.randomBytes(32);
const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
const message = 'hello test ' + Date.now();

const msgUint8 = new TextEncoder().encode(message);
const box = nacl.secretbox(msgUint8, nonce, key);

const enc = uint8ArrayToBase64(box);
const nB64 = uint8ArrayToBase64(nonce);
const kB64 = uint8ArrayToBase64(key);

// Decrypt
const decrypted = nacl.secretbox.open(base64ToUint8Array(enc), base64ToUint8Array(nB64), base64ToUint8Array(kB64));

if (!decrypted) {
  console.error('Decryption failed');
  process.exit(2);
}

const decoded = new TextDecoder().decode(decrypted);
if (decoded !== message) {
  console.error('Roundtrip mismatch', { decoded, message });
  process.exit(3);
}

console.log('crypto test OK');
process.exit(0);
