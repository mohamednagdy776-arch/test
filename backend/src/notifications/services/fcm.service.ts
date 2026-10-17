import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

// FCM via the HTTP v1 API (firebase-admin). The legacy `fcm/send` endpoint +
// FCM_SERVER_KEY used before was shut down by Google in 2024, so no push ever
// reached a device. Credentials: FIREBASE_SERVICE_ACCOUNT_B64 = base64 of the
// Firebase service-account JSON, set only in .env.production on the VPS.
// Unset → log-only mock, as before, so dev/CI need no Firebase project.
@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);
  private app: admin.app.App | null | undefined;

  private getApp(): admin.app.App | null {
    if (this.app !== undefined) return this.app;
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
    if (!b64) {
      this.app = null;
      return null;
    }
    try {
      const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      this.app = admin.initializeApp(
        { credential: admin.credential.cert(serviceAccount) },
        'tayyibt-fcm',
      );
    } catch (err) {
      this.logger.error(`Firebase init failed (mobile push disabled): ${err}`);
      this.app = null;
    }
    return this.app;
  }

  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    const { sent, invalidTokens } = await this.sendToMultiple([token], title, body, data);
    return sent === 1 && invalidTokens.length === 0;
  }

  /**
   * Sends one notification to every token. Returns the tokens FCM reported as
   * no longer registered (app uninstalled / token rotated) so the caller can
   * deactivate them.
   */
  async sendToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ sent: number; invalidTokens: string[] }> {
    if (tokens.length === 0) return { sent: 0, invalidTokens: [] };
    const app = this.getApp();
    if (!app) {
      this.logger.log(`[FCM Mock] ${tokens.length} device(s): ${title} - ${body}`);
      return { sent: tokens.length, invalidTokens: [] };
    }
    try {
      const res = await app.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data,
        android: { priority: 'high', notification: { sound: 'default' } },
        apns: { payload: { aps: { sound: 'default' } } },
      });
      const invalidTokens: string[] = [];
      res.responses.forEach((r, i) => {
        const code = r.error?.code;
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          invalidTokens.push(tokens[i]);
        } else if (r.error) {
          this.logger.warn(`FCM send failed: ${code ?? r.error.message}`);
        }
      });
      return { sent: res.successCount, invalidTokens };
    } catch (err) {
      this.logger.warn(`FCM multicast failed: ${err}`);
      return { sent: 0, invalidTokens: [] };
    }
  }
}
