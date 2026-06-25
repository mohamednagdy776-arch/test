import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GuardianChatService } from '../guardian-chat.service';

function makeService(opts: { oversight?: any; guardianExists?: boolean; convos?: any[] } = {}) {
  const saved: any[] = [];
  const repo = {
    findOne: async ({ where }: any) => {
      if (where.guardianId && where.wardId) return opts.oversight ?? null; // getWardConversations gate
      if (where.wardId) return opts.oversight ?? null;
      return null;
    },
    count: async () => (opts.oversight ? 1 : 0),
    create: (x: any) => x,
    save: async (x: any) => { saved.push(x); return x; },
    delete: async () => undefined,
    find: async () => [],
    findByIds: async () => [],
  } as any;
  const usersRepo = { findOne: async () => (opts.guardianExists === false ? null : { id: 'g1' }), findByIds: async () => [] } as any;
  const chatService = { getConversations: async () => opts.convos ?? [] } as any;
  return { svc: new GuardianChatService(repo, usersRepo, chatService), saved };
}

describe('[Body_Sadek] GuardianChatService (#753)', () => {
  it('rejects being your own guardian', async () => {
    await expect(makeService().svc.setGuardian('u1', 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a nonexistent guardian', async () => {
    await expect(makeService({ guardianExists: false }).svc.setGuardian('u1', 'gX')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('sets an active guardian', async () => {
    const { svc, saved } = makeService();
    expect(await svc.setGuardian('u1', 'g1')).toEqual({ status: 'active' });
    expect(saved[0]).toMatchObject({ wardId: 'u1', guardianId: 'g1', status: 'active' });
  });

  it('isSupervised reflects active oversight', async () => {
    expect(await makeService({ oversight: { id: 'o1' } }).svc.isSupervised('u1')).toBe(true);
    expect(await makeService().svc.isSupervised('u1')).toBe(false);
  });

  it('ward-conversations is forbidden without an active oversight', async () => {
    await expect(makeService().svc.getWardConversations('g1', 'w1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('ward-conversations returns metadata only (no message bodies)', async () => {
    const convos = [{ id: 'c1', otherUser: { id: 'x' }, updatedAt: 'now', lastMessage: 'secret encrypted blob' }];
    const { svc } = makeService({ oversight: { id: 'o1' }, convos });
    const res = await svc.getWardConversations('g1', 'w1');
    expect(res[0]).toEqual({ id: 'c1', otherUser: { id: 'x' }, updatedAt: 'now' });
    expect(JSON.stringify(res)).not.toContain('secret encrypted blob');
  });
});
