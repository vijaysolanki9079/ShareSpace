import nacl from 'tweetnacl';

// Minimal base64 helpers for browser
function uint8ArrayToBase64(u8: Uint8Array) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < u8.length; i += chunkSize) {
    const sub = u8.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(sub) as any);
  }
  return typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
}

function base64ToUint8Array(b64: string) {
  const binary = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function getOrCreateChatKey(): string {
  if (typeof window === 'undefined') throw new Error('getOrCreateChatKey is client-only');
  const k = localStorage.getItem('sharespace_chat_key');
  if (k) return k;
  const key = nacl.randomBytes(32);
  const b64 = uint8ArrayToBase64(key);
  try {
    localStorage.setItem('sharespace_chat_key', b64);
  } catch (err) {
    // ignore storage errors
  }
  return b64;
}

export function encryptMessage(keyBase64: string, message: string) {
  const key = base64ToUint8Array(keyBase64);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const msgUint8 = new TextEncoder().encode(message);
  const box = nacl.secretbox(msgUint8, nonce, key);
  return {
    encrypted: uint8ArrayToBase64(box),
    nonce: uint8ArrayToBase64(nonce),
  };
}

export function decryptMessage(keyBase64: string, encryptedB64: string, nonceB64: string): string | null {
  const key = base64ToUint8Array(keyBase64);
  const nonce = base64ToUint8Array(nonceB64);
  const box = base64ToUint8Array(encryptedB64);
  const opened = nacl.secretbox.open(box, nonce, key);
  if (!opened) return null;
  return new TextDecoder().decode(opened);
}

// Note: This is MVP-only local symmetric-key handling. For production, use
// server-side encryption or a proper E2E key-management solution.
