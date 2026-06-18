import { Injectable } from '@nestjs/common';

@Injectable()
export class FcmService {
  private readonly fcmServerKey = process.env.FCM_SERVER_KEY;

  async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.fcmServerKey) {
      console.log(`[FCM Mock] Notification to ${token}: ${title} - ${body}`);
      return true;
    }
    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${this.fcmServerKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: token, notification: { title, body }, data }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async sendToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    await Promise.allSettled(tokens.map(token => this.sendToDevice(token, title, body, data)));
  }
}
