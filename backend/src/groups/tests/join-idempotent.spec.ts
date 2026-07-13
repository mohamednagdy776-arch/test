import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { GroupsService } from '../services/groups.service';

// [Body_Sadek] #734 — a double-clicked Join button fired two POSTs; the second
// 409'd as an unhandled console error. Joining when already a member is now a
// no-op success (banned members are still rejected).

const group = { id: 'g1', privacy: 'public' };

function makeService(existingMember: any) {
  const groupsRepo = { findOne: async () => group } as any;
  const memberRepo = {
    findOne: async () => existingMember,
    create: (x: any) => x,
    save: async (x: any) => x,
  } as any;
  const notifications = { notifyUser: async () => {} } as any;
  return new GroupsService(groupsRepo, memberRepo, notifications);
}

describe('[Body_Sadek] GroupsService.join idempotency (#734)', () => {
  it('returns the group instead of 409 when already a member', async () => {
    const svc = makeService({ id: 'm1', isBanned: false });
    const res: any = await svc.join('g1', { id: 'u1' } as any);
    expect(res.id).toBe('g1');
  });

  it('still rejects a banned member', async () => {
    const svc = makeService({ id: 'm1', isBanned: true });
    await expect(svc.join('g1', { id: 'u1' } as any)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('joins a new member successfully', async () => {
    const svc = makeService(null);
    const res: any = await svc.join('g1', { id: 'u1' } as any);
    expect(res.id).toBe('g1');
  });
});
