import 'reflect-metadata';
import { describe, it, expect } from '@jest/globals';
import { NotificationsService } from '../services/notifications.service';

// Notifications now record the actor and expose it as a safe `fromUser` so the
// dropdown can render "<name> accepted your friend request" (previously the name
// was missing because no actor was stored/returned).
describe('[Body_Sadek] notification actor → fromUser', () => {
  function makeService(rows: any[]) {
    const notificationRepo = { findAndCount: async () => [rows, rows.length] } as any;
    return new NotificationsService(notificationRepo, {} as any);
  }

  it('maps the actor to fromUser with name + avatar and drops secrets', async () => {
    const actor = {
      id: 'actor1', username: 'ahmed', firstName: 'Ahmed', lastName: 'Ali',
      email: 'ahmed@x.test', passwordHash: 'SECRET',
      profile: { fullName: 'Ahmed Ali', avatarUrl: '/a.jpg' },
    };
    const svc = makeService([{ id: 'n1', type: 'friend_accepted', message: 'قبل طلب صداقتك', actor, actorId: 'actor1' }]);
    const { data } = await svc.findByUser('u1', 1, 20);
    const n: any = data[0];

    expect(n.fromUser).toEqual({
      id: 'actor1',
      username: 'ahmed',
      profile: { fullName: 'Ahmed Ali', avatarUrl: '/a.jpg' },
    });
    expect(n.actor).toBeUndefined();
    expect(JSON.stringify(n)).not.toContain('passwordHash');
    expect(JSON.stringify(n)).not.toContain('ahmed@x.test');
  });

  it('falls back to first+last name and yields null fromUser for system notifications', async () => {
    const svc = makeService([
      { id: 'n2', type: 'like', message: 'liked your post', actor: { id: 'a2', firstName: 'Sara', lastName: 'M', profile: null }, actorId: 'a2' },
      { id: 'n3', type: 'system', message: 'Welcome', actor: null, actorId: null },
    ]);
    const { data } = await svc.findByUser('u1', 1, 20);
    expect((data[0] as any).fromUser.profile.fullName).toBe('Sara M');
    expect((data[1] as any).fromUser).toBeNull();
  });
});
