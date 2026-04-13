/**
 * Secure E2EE Utilities using Web Crypto API.
 * Zero-Knowledge Architecture.
 */

// Convert ArrayBuffer back and forth to base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate new ECDH Master Key Pair for E2EE
export async function generateChatKeyPair(): Promise<CryptoKeyPair> {
  return await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true, // Extractable so we can wrap it
    ["deriveKey", "deriveBits"]
  );
}

// Derive a KEK (Key-Encryption Key) from the manual Chat Passphrase using PBKDF2
export async function deriveKEK(passphrase: string, saltBase64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const saltBuffer = base64ToArrayBuffer(saltBase64);

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Securely wrap (encrypt) the private key using the KEK
export async function wrapPrivateKey(privateKey: CryptoKey, kek: CryptoKey): Promise<{ encryptedKeyBase64: string, ivBase64: string }> {
  // Export private key to PKCS8 format
  const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
  
  // Encrypt with KEK
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    kek,
    exported
  );

  return {
    encryptedKeyBase64: arrayBufferToBase64(encrypted),
    ivBase64: arrayBufferToBase64(iv.buffer)
  };
}

// Unwrap (decrypt) the private key using KEK
export async function unwrapPrivateKey(encryptedKeyBase64: string, ivBase64: string, kek: CryptoKey): Promise<CryptoKey> {
  const encryptedBuffer = base64ToArrayBuffer(encryptedKeyBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    kek,
    encryptedBuffer
  );

  return await crypto.subtle.importKey(
    "pkcs8",
    decrypted,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );
}

// Derive Shared Secret between my Private Key and Recipient's Public Key
async function deriveSharedSecretKey(myPrivateKey: CryptoKey, recipientPublicKeyBase64: string): Promise<CryptoKey> {
  // Import recipient public key from SPKI/Raw/JWK format. For this example we use spki
  const recipientKeyBuffer = base64ToArrayBuffer(recipientPublicKeyBase64);
  const recipientPublicKey = await crypto.subtle.importKey(
    "spki",
    recipientKeyBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  return await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: recipientPublicKey
    },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Encrypt an actual chat message
export async function encryptMessage(content: string, myPrivateKey: CryptoKey, recipientPublicKeyBase64: string): Promise<string> {
  const sharedKey = await deriveSharedSecretKey(myPrivateKey, recipientPublicKeyBase64);
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    enc.encode(content)
  );

  // Payload format: base64(iv):base64(ciphertext)
  return `${arrayBufferToBase64(iv.buffer)}:${arrayBufferToBase64(ciphertext)}`;
}

// Decrypt an actual chat message
export async function decryptMessage(encryptedPayload: string, myPrivateKey: CryptoKey, senderPublicKeyBase64: string): Promise<string> {
  const sharedKey = await deriveSharedSecretKey(myPrivateKey, senderPublicKeyBase64);
  const [ivBase64, cipherBase64] = encryptedPayload.split(':');
  
  const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));
  const ciphertext = base64ToArrayBuffer(cipherBase64);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    ciphertext
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key);
  return arrayBufferToBase64(exported);
}

export function generateSalt(): string {
  return arrayBufferToBase64(crypto.getRandomValues(new Uint8Array(16)).buffer);
}
