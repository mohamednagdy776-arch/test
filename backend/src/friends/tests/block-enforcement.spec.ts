import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { ForbiddenException } from '@nestjs/common';
import { FriendsService } from '../services/friends.service';

// [Body_Sadek] Regression test for #758 — POST /blocks writes the `blocks` table
// but friend-request enforcement read the orphaned `user_blocks` table, so a
// block did nothing. Enforcement now goes through isBlockedEither(blocks table).

function makeService(blockExists: boolean) {
  const friendshipsRepo = { findOne: async () => null, create: (x: any) => x, save: async (x: any) => x } as any;
  const userBlockRepo = { count: async () => (blockExists ? 1 : 0) } as any;
  const noop = {} as any;
  return new FriendsService(friendshipsRepo, noop, noop, noop, noop, userBlockRepo, noop);
}

describe('[Body_Sadek] FriendsService block enforcement (#758)', () => {
  it('isBlockedEither returns true when a block row exists', async () => {
    expect(await makeService(true).isBlockedEither('a', 'b')).toBe(true);
  });

  it('isBlockedEither short-circuits self/empty without a query', async () => {
    const svc = makeService(true); // count would return 1, but self must be false
    expect(await svc.isBlockedEither('a', 'a')).toBe(false);
    expect(await svc.isBlockedEither('', 'b')).toBe(false);
  });

  it('sendRequest is rejected when the pair is blocked', async () => {
    await expect(makeService(true).sendRequest('a', 'b')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sendRequest proceeds when there is no block', async () => {
    const res: any = await makeService(false).sendRequest('a', 'b');
    expect(res.requesterId).toBe('a');
    expect(res.addresseeId).toBe('b');
  });
});
