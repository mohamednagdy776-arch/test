import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from '../controllers/users.controller';

// [Body_Sadek] Regression test for #728/#729 — GET /users/:username used to
// return 200 {success:true,data:{friendshipStatus:null}} for ANY nonexistent
// user because the controller spread a null profile (`{ ...null }` -> `{}`).
// It must 404 instead so the frontend stops rendering ghost profiles.
describe('[Body_Sadek] UsersController getFullProfile (#728)', () => {
  it('throws NotFoundException when the user/username does not exist', async () => {
    const usersService = { getFullProfile: async () => null } as any;
    const controller = new UsersController(usersService, {} as any, {} as any, { recordView: async () => undefined } as any);

    await expect(controller.getFullProfile('does-not-exist')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns the profile with friendshipStatus when the user exists', async () => {
    const usersService = {
      getFullProfile: async () => ({ userId: 'u2', username: 'real' }),
      getFriendshipStatus: async () => 'none',
    } as any;
    const controller = new UsersController(usersService, {} as any, {} as any, { recordView: async () => undefined } as any);

    const res: any = await controller.getFullProfile('real', { id: 'u1' } as any);
    expect(res.success).toBe(true);
    expect(res.data.username).toBe('real');
    expect(res.data.friendshipStatus).toBe('none');
  });
});
