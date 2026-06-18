import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    await this.fcmService.sendToMultiple(tokens.map(t => t.token), title, body, data);
    await this.tokensRepo.update({ userId, isActive: true }, { lastUsedAt: new Date() });
  }

  private isEnabled(pref: NotificationPreference, type: string): boolean {
    const map: Record<string, keyof NotificationPreference> = {
      'new_match': 'newMatch',
      'new_message': 'newMessage',
      'post_reaction': 'postReaction',
      'post_comment': 'postComment',
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
