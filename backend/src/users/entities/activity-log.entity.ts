import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ActivityType {
  post = 'post',
  like = 'like',
  comment = 'comment',
  tag = 'tag',
  friend_add = 'friend_add',
  photo = 'photo',
  video = 'video',
}

@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @Column({ name: 'target_id', nullable: true })
  targetId: string;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
