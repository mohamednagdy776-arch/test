import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type NotificationType =
  | 'friend_request' | 'friend_accepted' | 'like' | 'comment' | 'tag'
  | 'share' | 'mention' | 'birthday' | 'group_invite' | 'event_invite'
  | 'memory' | 'story_view' | 'vote' | 'follow';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // The user who triggered the notification (who liked/commented/accepted). Used
  // to render "<name> accepted your friend request" — previously not stored, so
  // the name was missing from the dropdown.
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'actor_id' })
  actor: User;

  @Column({ name: 'actor_id', nullable: true })
  actorId: string;

  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column()
  message: string;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ default: false })
  readStatus: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
