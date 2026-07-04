import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

// [Body_Sadek] #731 — the logged-in change-password endpoint didn't exist
// (frontend POSTed to a 404). It now verifies the current password and sets a
// new one (complexity enforced by ChangePasswordDto at the controller boundary).

function makeService(user: any) {
  const usersRepo = {
    findOne: async () => user,
    update: async (_id: string, patch: any) => Object.assign(user, patch),
  } as any;
  const sessionsRepo = { delete: async () => undefined } as any;
  const mail = { sendPasswordChangedEmail: async () => undefined } as any;
  return new AuthService(usersRepo, sessionsRepo, {} as any, {} as any, mail, {} as any);
}

describe('[Body_Sadek] AuthService.changePassword (#731)', () => {
  it('rejects a wrong current password', async () => {
    const user: any = { id: 'u1', email: 'u@x.test', passwordHash: await bcrypt.hash('Correct1!', 12) };
    const svc = makeService(user);
    await expect(svc.changePassword('u1', 'WrongPass1!', 'NewStrong1!')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('sets a new bcrypt hash when the current password matches', async () => {
    const user: any = { id: 'u1', email: 'u@x.test', passwordHash: await bcrypt.hash('Correct1!', 12) };
    const svc = makeService(user);
    const res: any = await svc.changePassword('u1', 'Correct1!', 'NewStrong1!');
    expect(res.message).toContain('changed');
    expect(await bcrypt.compare('NewStrong1!', user.passwordHash)).toBe(true);
  });
});
