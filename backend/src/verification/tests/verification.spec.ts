import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { VerificationService } from '../verification.service';

function makeService(latest: any = null) {
  const profileUpdates: any[] = [];
  const verRows: any = { byId: { v1: { id: 'v1', userId: 'u9', status: 'pending' } } };
  const verRepo = {
    findOne: async ({ where, order }: any) => {
      if (where.id) return verRows.byId[where.id] ?? null;
      return latest; // getLatest(userId)
    },
    create: (x: any) => x,
    save: async (x: any) => x,
    findAndCount: async () => [[], 0],
  } as any;
  const profilesRepo = { update: async (where: any, patch: any) => { profileUpdates.push({ where, patch }); } } as any;
  return { svc: new VerificationService(verRepo, profilesRepo), profileUpdates };
}

describe('[Body_Sadek] VerificationService — identity KYC (#755)', () => {
  it('reports unverified when there is no submission', async () => {
    expect(await makeService(null).svc.getMyStatus('u1')).toEqual({ status: 'unverified' });
  });

  it('blocks a new submission while one is already approved', async () => {
    await expect(makeService({ status: 'approved' }).svc.submit('u1', Buffer.from('a'), Buffer.from('b')))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks a new submission while one is pending review', async () => {
    await expect(makeService({ status: 'pending' }).svc.submit('u1', Buffer.from('a'), Buffer.from('b')))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('approving sets the profile identity-verified badge', async () => {
    const { svc, profileUpdates } = makeService();
    const res = await svc.approve('v1', 'admin1');
    expect(res.status).toBe('approved');
    expect(profileUpdates[0].patch).toEqual({ isIdentityVerified: true });
  });

  it('rejecting records the reason and does not set the badge', async () => {
    const { svc, profileUpdates } = makeService();
    const res = await svc.reject('v1', 'admin1', '  blurry  ');
    expect(res.status).toBe('rejected');
    expect(profileUpdates).toHaveLength(0);
  });
});
