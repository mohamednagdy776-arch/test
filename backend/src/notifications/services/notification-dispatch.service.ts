import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DeviceToken } from '../entities/device-token.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { FcmService } from './fcm.service';

@Injectable()
export class NotificationDispatchService {
  constructor(
    @InjectRepository(DeviceToken)
    private tokensRepo: Repository<DeviceToken>,
    @InjectRepository(NotificationPreference)
    private prefsRepo: Repository<NotificationPreference>,
    private fcmService: FcmService,
  ) {}

  async sendNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const pref = await this.prefsRepo.findOne({ where: { userId } });
    if (pref && !this.isEnabled(pref, type)) return; // user opted out

    const tokens = await this.tokensRepo.find({ where: { userId, isActive: true } });
    if (tokens.length === 0) return;

    const { invalidTokens } = await this.fcmService.sendToMultiple(tokens.map(t => t.token), title, body, data);
    if (invalidTokens.length) {
      await this.tokensRepo.update({ token: In(invalidTokens) }, { isActive: false });
    }
    await this.tokensRepo.update({ userId, isActive: true }, { lastUsedAt: new Date() });
  }

  /** Fire-and-forget: a push failure must never break the action that triggered it. */
  notify(userId: string, type: string, title: string, body: string, data?: Record<string, string>): void {
    this.sendNotification(userId, type, title, body, data).catch(() => undefined);
  }

  private isEnabled(pref: NotificationPreference, type: string): boolean {
    const map: Record<string, keyof NotificationPreference> = {
      'new_match': 'newMatch',
      'new_message': 'newMessage',
      'post_reaction': 'postReaction',
      'post_comment': 'postComment',
      // In-app notification types (notification.entity.ts) sharing a preference.
      'like': 'postReaction',
      'comment': 'postComment',
      'medical_result_ready': 'medicalResultReady',
      'consent_request': 'consentRequest',
      'subscription_events': 'subscriptionEvents',
      'lab_result_submitted': 'labResultSubmitted',
      'system_announcements': 'systemAnnouncements',
    };
    const field = map[type];
    return field ? (pref[field] as boolean) !== false : true;
  }
}
