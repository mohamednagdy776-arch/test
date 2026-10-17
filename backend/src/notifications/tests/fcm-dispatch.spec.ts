import 'reflect-metadata';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const sendEachForMulticast = jest.fn<(...args: any[]) => Promise<any>>();
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(() => ({ messaging: () => ({ sendEachForMulticast }) })),
  credential: { cert: jest.fn(() => ({})) },
}));

import { FcmService } from '../services/fcm.service';
import { NotificationDispatchService } from '../services/notification-dispatch.service';

// Mobile push moved from the dead legacy FCM API to HTTP v1 (firebase-admin).
describe('FCM v1 push', () => {
  beforeEach(() => {
    sendEachForMulticast.mockReset();
    delete process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  });

  it('mocks (no network) when FIREBASE_SERVICE_ACCOUNT_B64 is unset', async () => {
    const res = await new FcmService().sendToMultiple(['t1'], 'title', 'body');
    expect(res).toEqual({ sent: 1, invalidTokens: [] });
    expect(sendEachForMulticast).not.toHaveBeenCalled();
  });

  it('sends a multicast and reports unregistered tokens', async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_B64 = Buffer.from('{"project_id":"x"}').toString('base64');
    sendEachForMulticast.mockResolvedValue({
      successCount: 1,
      responses: [
        { success: true },
        { success: false, error: { code: 'messaging/registration-token-not-registered', message: '' } },
      ],
    });
    const res = await new FcmService().sendToMultiple(['good', 'stale'], 'Ahmed', 'hi', { type: 'like' });
    expect(res).toEqual({ sent: 1, invalidTokens: ['stale'] });
    const arg: any = sendEachForMulticast.mock.calls[0][0];
    expect(arg.tokens).toEqual(['good', 'stale']);
    expect(arg.notification).toEqual({ title: 'Ahmed', body: 'hi' });
    expect(arg.data).toEqual({ type: 'like' });
  });

  it('dispatch deactivates stale tokens and honours opt-out', async () => {
    const update = jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({});
    const tokensRepo: any = {
      find: async () => [{ token: 'good' }, { token: 'stale' }],
      update,
    };
    const fcm: any = { sendToMultiple: async () => ({ sent: 1, invalidTokens: ['stale'] }) };

    const optedIn = new NotificationDispatchService(tokensRepo, { findOne: async () => null } as any, fcm);
    await optedIn.sendNotification('u1', 'new_message', 't', 'b');
    const deactivate: any = update.mock.calls.find((c: any) => c[1]?.isActive === false);
    expect(deactivate).toBeDefined();
    expect(deactivate[0].token.value).toEqual(['stale']);

    update.mockClear();
    const optedOut = new NotificationDispatchService(
      tokensRepo,
      { findOne: async () => ({ postReaction: false }) } as any,
      fcm,
    );
    await optedOut.sendNotification('u1', 'like', 't', 'b'); // 'like' maps to postReaction
    expect(update).not.toHaveBeenCalled();
  });
});
