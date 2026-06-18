import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'new_match', default: true })
  newMatch: boolean;

  @Column({ name: 'new_message', default: true })
  newMessage: boolean;

  @Column({ name: 'post_reaction', default: true })
  postReaction: boolean;

  @Column({ name: 'post_comment', default: true })
  postComment: boolean;

  @Column({ name: 'medical_result_ready', default: true })
  medicalResultReady: boolean;

  @Column({ name: 'consent_request', default: true })
  consentRequest: boolean;

  @Column({ name: 'subscription_events', default: true })
  subscriptionEvents: boolean;

  @Column({ name: 'lab_result_submitted', default: true })
  labResultSubmitted: boolean;

  @Column({ name: 'system_announcements', default: true })
  systemAnnouncements: boolean;
}
