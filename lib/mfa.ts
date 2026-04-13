import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const MFA_ISSUER = "ShareSpace";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

function getEncryptionKey() {
  const keySource = process.env.MFA_ENCRYPTION_KEY ?? process.env.NEXTAUTH_SECRET;

  if (!keySource) {
    throw new Error("Missing MFA_ENCRYPTION_KEY or NEXTAUTH_SECRET for MFA secret encryption");
  }

  return createHash("sha256").update(keySource).digest();
}

function normalizeBase32(input: string) {
  return input.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
}

function base32Encode(buffer: Buffer) {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(input: string) {
  const normalized = normalizeBase32(input);
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);

    if (index === -1) {
      throw new Error("Invalid base32 secret");
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

function generateHotp(secret: string, counter: number, digits = TOTP_DIGITS) {
  const secretBuffer = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);

  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", secretBuffer).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binaryCode =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (binaryCode % 10 ** digits).toString().padStart(digits, "0");
}

export function generateBase32Secret(length = 20) {
  return base32Encode(randomBytes(length));
}

export function generateBackupCodes(count = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  return Array.from({ length: count }, () => {
    let code = "";

    for (let i = 0; i < 12; i += 1) {
      code += chars[randomBytes(1)[0] % chars.length];

      if (i === 3 || i === 7) {
        code += "-";
      }
    }

    return code;
  });
}

export function buildOtpAuthUrl(email: string, secret: string) {
  const label = `${MFA_ISSUER}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer: MFA_ISSUER,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

export function verifyTotpToken(secret: string, token: string, window = 1) {
  if (!/^\d{6}$/.test(token)) {
    return false;
  }

  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS);
  const expected = Buffer.from(token);

  for (let offset = -window; offset <= window; offset += 1) {
    const candidate = Buffer.from(generateHotp(secret, currentCounter + offset));

    if (candidate.length === expected.length && timingSafeEqual(candidate, expected)) {
      return true;
    }
  }

  return false;
}

export function encryptMfaSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

export function decryptMfaSecret(payload: string) {
  const [iv, tag, encrypted] = payload.split(".");

  if (!iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted MFA secret");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(iv, "base64url")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
