import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import webpush from 'web-push';
import { PushSubscriptionEntity } from '../entities/push-subscription.entity';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @InjectRepository(PushSubscriptionEntity)
    private subsRepo: Repository<PushSubscriptionEntity>,
  ) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const email = process.env.VAPID_EMAIL || 'mailto:admin@tayyibt.com';

    if (publicKey && privateKey) {
      webpush.setVapidDetails(email, publicKey, privateKey);
    }
  }

  getVapidPublicKey(): string {
    return process.env.VAPID_PUBLIC_KEY || '';
  }

  async subscribe(userId: string, endpoint: string, p256dh: string, authKey: string) {
    const existing = await this.subsRepo.findOne({ where: { userId, endpoint } });
    if (existing) {
      existing.p256dh = p256dh;
      existing.authKey = authKey;
      return this.subsRepo.save(existing);
    }
    const sub = this.subsRepo.create({ userId, endpoint, p256dh, authKey });
    return this.subsRepo.save(sub);
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.subsRepo.delete({ userId, endpoint });
  }

  async sendToUser(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
    const subscriptions = await this.subsRepo.find({ where: { userId } });
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.authKey } },
          JSON.stringify(payload),
        ).catch(async (err: any) => {
          if (err.statusCode === 410) {
            await this.subsRepo.delete(sub.id);
          }
          throw err;
        }),
      ),
    );
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed) this.logger.warn(`${failed} push(es) failed for user ${userId}`);
  }
}
