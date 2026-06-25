import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { PhotoPrivacyService } from '../photo-privacy.service';

function makeService(opts: { approved?: boolean; friends?: boolean; mutual?: boolean } = {}) {
  const accessRepo = { findOne: async () => (opts.approved ? { status: 'approved' } : null) } as any;
  const friendshipsRepo = { count: async () => (opts.friends ? 1 : 0) } as any;
  const interestsRepo = { count: async () => (opts.mutual ? 1 : 0) } as any;
  return new PhotoPrivacyService(accessRepo, friendshipsRepo, interestsRepo);
}

describe('[Body_Sadek] PhotoPrivacyService.canViewPhoto (#752)', () => {
  it('public is visible to anyone', async () => {
    expect(await makeService().canViewPhoto('v', 'owner', 'public')).toBe(true);
  });

  it('owner always sees their own photos', async () => {
    expect(await makeService().canViewPhoto('owner', 'owner', 'private')).toBe(true);
  });

  it('private hides from everyone else', async () => {
    expect(await makeService().canViewPhoto('v', 'owner', 'private')).toBe(false);
  });

  it('on_request requires an approved access request', async () => {
    expect(await makeService({ approved: false }).canViewPhoto('v', 'owner', 'on_request')).toBe(false);
    expect(await makeService({ approved: true }).canViewPhoto('v', 'owner', 'on_request')).toBe(true);
  });

  it('matches_only allows accepted friends or mutual interest', async () => {
    expect(await makeService({}).canViewPhoto('v', 'owner', 'matches_only')).toBe(false);
    expect(await makeService({ friends: true }).canViewPhoto('v', 'owner', 'matches_only')).toBe(true);
    expect(await makeService({ mutual: true }).canViewPhoto('v', 'owner', 'matches_only')).toBe(true);
  });
});
