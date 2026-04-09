import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type NotificationType = 
  | 'friend_request' | 'friend_accepted' | 'like' | 'comment' | 'tag' 
  | 'share' | 'mention' | 'birthday' | 'group_invite' | 'event_invite' 
  | 'memory' | 'story_view';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

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
