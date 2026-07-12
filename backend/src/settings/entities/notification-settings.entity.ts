import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('notification_settings')
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'notifications_enabled', default: true })
  notificationsEnabled: boolean;

  @Column({ name: 'likes_notifications', default: true })
  likesNotifications: boolean;

  @Column({ name: 'comments_notifications', default: true })
  commentsNotifications: boolean;

  @Column({ name: 'friend_requests_notifications', default: true })
  friendRequestsNotifications: boolean;

  @Column({ name: 'messages_notifications', default: true })
  messagesNotifications: boolean;

  @Column({ name: 'mentions_notifications', default: true })
  mentionsNotifications: boolean;

  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @Column({ name: 'push_notifications', default: true })
  pushNotifications: boolean;

  @Column({ name: 'sms_notifications', default: false })
  smsNotifications: boolean;
}
