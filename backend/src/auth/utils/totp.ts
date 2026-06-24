import { createHmac, randomBytes } from 'crypto';

// Minimal RFC 4648 base32 + RFC 6238 TOTP implementation.
//
// The previous 2FA code stored a base64 secret and HMAC'd the decimal epoch
// string, so no standard authenticator (Google Authenticator, Authy, …) could
// ever produce a matching code (#743). Authenticators require a base32 secret
// and the RFC 6238 algorithm (8-byte big-endian counter = floor(time/period),
// SHA-1 HMAC, dynamic truncation). This module implements exactly that and is
// verified against the RFC 6238 test vectors in the unit tests.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out; // no padding — accepted by authenticator apps
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char);
    if (idx === -1) continue; // skip any stray non-alphabet chars
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** Generate a new base32-encoded TOTP secret (default 20 random bytes = 160 bits). */
export function generateTotpSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes));
}

/** Compute the 6-digit TOTP for a given base32 secret and counter (RFC 6238 / RFC 4226). */
function generateCode(secret: string, counter: number, digits = 6): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  // 8-byte big-endian counter. Counters fit in <= 53 bits for any realistic
  // time, so split across two 32-bit writes to stay within JS integer range.
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (binary % 10 ** digits).toString().padStart(digits, '0');
}

/**
 * Verify a TOTP code against a base32 secret, allowing ±`window` time steps to
 * absorb clock skew (default ±1 step = ±30s).
 */
export function verifyTotp(token: string, secret: string, period = 30, window = 1): boolean {
  if (!token || !secret) return false;
  const normalized = token.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;
  const counter = Math.floor(Date.now() / 1000 / period);
  for (let i = -window; i <= window; i++) {
    if (generateCode(secret, counter + i) === normalized) return true;
  }
  return false;
}

/** Build the otpauth:// URI an authenticator app scans as a QR code. */
export function buildOtpauthUrl(secret: string, accountName: string, issuer = 'Tayyibt'): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
