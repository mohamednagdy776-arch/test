import 'reflect-metadata';
import { describe, it, expect, afterEach } from '@jest/globals';
import { base32Encode, base32Decode, verifyTotp, generateTotpSecret, buildOtpauthUrl } from '../utils/totp';

// RFC 6238 reference secret: ASCII "12345678901234567890" (20 bytes).
const RFC_SECRET_BASE32 = base32Encode(Buffer.from('12345678901234567890', 'ascii'));

const realNow = Date.now;
afterEach(() => {
  Date.now = realNow;
});

describe('[Body_Sadek] TOTP util (#743)', () => {
  it('base32 round-trips and uses the RFC 4648 alphabet', () => {
    expect(RFC_SECRET_BASE32).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    expect(base32Decode(RFC_SECRET_BASE32).toString('ascii')).toBe('12345678901234567890');
  });

  it('matches RFC 6238 6-digit test vectors', () => {
    // Known 6-digit TOTPs (truncated from the published 8-digit RFC vectors).
    const vectors: Array<[number, string]> = [
      [59, '287082'],
      [1111111109, '081804'],
      [1234567890, '005924'],
    ];
    for (const [t, expected] of vectors) {
      Date.now = () => t * 1000;
      expect(verifyTotp(expected, RFC_SECRET_BASE32)).toBe(true);
    }
  });

  it('rejects wrong / malformed codes', () => {
    Date.now = () => 59 * 1000;
    expect(verifyTotp('000000', RFC_SECRET_BASE32)).toBe(false);
    expect(verifyTotp('abc', RFC_SECRET_BASE32)).toBe(false);
    expect(verifyTotp('', RFC_SECRET_BASE32)).toBe(false);
  });

  it('generates a valid base32 secret and otpauth URL', () => {
    const secret = generateTotpSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/);
    const url = buildOtpauthUrl(secret, 'user@tayyibt.test');
    expect(url).toMatch(/^otpauth:\/\/totp\/Tayyibt(:|%3A)/);
    expect(url).toContain(`secret=${secret}`);
    expect(url).toContain('issuer=Tayyibt');
    expect(url).toContain('algorithm=SHA1');
  });
});
