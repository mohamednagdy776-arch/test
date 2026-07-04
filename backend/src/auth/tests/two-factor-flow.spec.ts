import 'reflect-metadata';
import { describe, it, expect, afterEach } from '@jest/globals';
import { createHash } from 'crypto';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { base32Encode } from '../utils/totp';

// [Body_Sadek] #759 — enabling 2FA used to flip twoFactorEnabled=true BEFORE the
// user proved their authenticator works, and there were no backup codes, so a
// broken/abandoned setup permanently locked the account out. Now 2FA only turns
// on after a verified code, and enrollment issues one-time backup codes.

const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890', 'ascii'));
const realNow = Date.now;
afterEach(() => { Date.now = realNow; });

function makeService(user: any) {
  const updates: any[] = [];
  const usersRepo = {
    findOne: async () => user,
    update: async (_id: string, patch: any) => { updates.push(patch); Object.assign(user, patch); },
  } as any;
  const svc = new AuthService(usersRepo, {} as any, {} as any, {} as any, {} as any, {} as any);
  return { svc, updates };
}

describe('[Body_Sadek] 2FA enrollment & recovery (#759)', () => {
  it('setup does NOT enable 2FA — it only stages a base32 secret + otpauth URL', async () => {
    const user = { id: 'u1', email: 'u@tayyibt.test' };
    const { svc, updates } = makeService(user);
    const res: any = await svc.setupTwoFactor('u1');

    expect(res.secret).toMatch(/^[A-Z2-7]+$/);
    expect(res.otpauthUrl).toContain('otpauth://totp/');
    expect(updates[0].twoFactorEnabled).toBe(false); // not enabled until verified
    expect(updates[0].totpSecret).toBe(res.secret);
  });

  it('verifying setup with a valid code enables 2FA and returns one-time backup codes', async () => {
    Date.now = () => 59 * 1000; // RFC vector slot → code 287082
    const user: any = { id: 'u1', email: 'u@tayyibt.test', totpSecret: RFC_SECRET, twoFactorEnabled: false };
    const { svc } = makeService(user);

    const res: any = await svc.verifyTwoFactorSetup('u1', '287082');
    expect(Array.isArray(res.backupCodes)).toBe(true);
    expect(res.backupCodes).toHaveLength(10);
    expect(user.twoFactorEnabled).toBe(true);
    expect(user.twoFactorVerified).toBe(true);
  });

  it('a backup code can disable 2FA when the authenticator is unavailable', async () => {
    const codeHash = createHash('sha256').update('AAAAA-BBBBB').digest('hex');
    const user = {
      id: 'u1', email: 'u@tayyibt.test', totpSecret: RFC_SECRET,
      twoFactorEnabled: true, twoFactorBackupCodes: JSON.stringify([codeHash]),
    };
    const { svc } = makeService(user);

    const res: any = await svc.disableTwoFactor('u1', 'aaaaa-bbbbb'); // case-insensitive
    expect(res.message).toContain('disabled');
    expect(user.twoFactorEnabled).toBe(false);
    expect(user.totpSecret).toBeNull();
  });

  it('rejects a wrong code on disable', async () => {
    const user = { id: 'u1', email: 'u@tayyibt.test', totpSecret: RFC_SECRET, twoFactorEnabled: true, twoFactorBackupCodes: null };
    const { svc } = makeService(user);
    Date.now = () => 59 * 1000;
    await expect(svc.disableTwoFactor('u1', '000000')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  // #64 — 2FA must not be re-enabled while already active (which would mint a new
  // secret + fresh backup codes and silently clobber the existing enrolment).
  it('setup refuses when 2FA is already enabled (#64)', async () => {
    const user = { id: 'u1', email: 'u@tayyibt.test', totpSecret: RFC_SECRET, twoFactorEnabled: true };
    const { svc, updates } = makeService(user);
    await expect(svc.setupTwoFactor('u1')).rejects.toBeInstanceOf(ConflictException);
    expect(updates).toHaveLength(0); // nothing was overwritten
  });

  it('verifySetup refuses when 2FA is already enabled (#64)', async () => {
    Date.now = () => 59 * 1000;
    const user = { id: 'u1', email: 'u@tayyibt.test', totpSecret: RFC_SECRET, twoFactorEnabled: true };
    const { svc } = makeService(user);
    await expect(svc.verifyTwoFactorSetup('u1', '287082')).rejects.toBeInstanceOf(ConflictException);
  });
});
