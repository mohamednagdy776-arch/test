import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { instanceToPlain } from 'class-transformer';
import { User } from '../entities/user.entity';

// [Body_Sadek] Regression test for #745 — the systemic secret leak where every
// endpoint that returned a raw User entity (blocks, friends/list, posts, comments,
// reactions, group members, stories, followers/following, pages, feed) exposed
// passwordHash, totpSecret and reset/verification tokens. The global
// ClassSerializerInterceptor runs instanceToPlain over responses, so @Exclude()
// on those columns must strip them here.

const SECRET_FIELDS = [
  'passwordHash',
  'totpSecret',
  'resetToken',
  'resetTokenExpires',
  'verificationToken',
  'verificationExpires',
  'failedLoginAttempts',
  'lockedUntil',
  'oauthId',
  // PII fields excluded after #802/#803 fix — should never appear in API responses
  'email',
  'phone',
] as const;

function makeUser(): User {
  const u = new User();
  Object.assign(u, {
    id: 'a1b2',
    email: 'victim@tayyibt.test',
    phone: '+99000000002',
    username: 'victim',
    firstName: 'Victim',
    passwordHash: '$2b$10$shouldNeverLeak',
    totpSecret: 'JBSWY3DPEHPK3PXP',
    resetToken: 'reset-secret',
    resetTokenExpires: new Date(),
    verificationToken: 'verify-secret',
    verificationExpires: new Date(),
    failedLoginAttempts: 3,
    lockedUntil: new Date(),
    oauthId: 'oauth-123',
  });
  return u;
}

describe('[Body_Sadek] User entity serialization (#745)', () => {
  it('strips all auth secrets when serialized directly', () => {
    const plain = instanceToPlain(makeUser());
    for (const field of SECRET_FIELDS) {
      expect(plain[field]).toBeUndefined();
    }
  });

  it('keeps safe public fields the app still needs', () => {
    const plain = instanceToPlain(makeUser());
    expect(plain.id).toBe('a1b2');
    expect(plain.username).toBe('victim');
    expect(plain.firstName).toBe('Victim');
  });

  it('strips secrets even when nested inside the {success,data} response envelope', () => {
    // Mirrors GET /blocks → ok([{ blocked: User }]); the interceptor serializes
    // the whole envelope, so nested User @Exclude must still apply.
    const envelope = { success: true, message: 'ok', data: [{ id: 'b1', blocked: makeUser() }] };
    const plain = instanceToPlain(envelope) as any;
    const blocked = plain.data[0].blocked;
    for (const field of SECRET_FIELDS) {
      expect(blocked[field]).toBeUndefined();
    }
  });
});
