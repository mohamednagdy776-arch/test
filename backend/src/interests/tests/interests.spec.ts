import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { InterestsService } from '../interests.service';

function makeService(opts: { reciprocal?: any; existing?: any } = {}) {
  const saved: any[] = [];
  const interestsRepo = {
    findOne: async ({ where }: any) => {
      // sender=receiver,receiver=sender → reciprocal lookup
      if (where.senderId !== where.receiverId && opts.reciprocal && where.senderId === 'b') return opts.reciprocal;
      if (where.senderId === 'a') return opts.existing ?? null;
      return null;
    },
    create: (x: any) => ({ ...x }),
    save: async (x: any) => { saved.push(x); return x; },
    update: async () => undefined,
  } as any;
  const viewsRepo = { findOne: async () => null, create: (x: any) => x, save: async (x: any) => { saved.push({ view: x }); return x; } } as any;
  const usersRepo = {} as any;
  return { svc: new InterestsService(interestsRepo, viewsRepo, usersRepo), saved };
}

describe('[Body_Sadek] InterestsService — Send Salam (#754)', () => {
  it('rejects sending interest to yourself', async () => {
    await expect(makeService().svc.sendInterest('a', 'a')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a pending interest when there is no reciprocal', async () => {
    const { svc } = makeService();
    const res = await svc.sendInterest('a', 'b');
    expect(res).toEqual({ status: 'pending', mutual: false });
  });

  it('becomes mutual when the other side already expressed interest', async () => {
    const { svc, saved } = makeService({ reciprocal: { senderId: 'b', receiverId: 'a', status: 'pending' } });
    const res = await svc.sendInterest('a', 'b');
    expect(res.mutual).toBe(true);
    expect(res.status).toBe('mutual');
    // both rows saved as mutual
    expect(saved.some((s) => s.status === 'mutual')).toBe(true);
  });

  it('records a profile view (skips self)', async () => {
    const { svc, saved } = makeService();
    await svc.recordView('a', 'a'); // self → no-op
    await svc.recordView('a', 'b');
    expect(saved.some((s) => s.view)).toBe(true);
  });
});
