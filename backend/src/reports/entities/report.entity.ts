import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ContentAction {
  NONE = 'none',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
  USER_BANNED = 'user_banned',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reportedBy: User;

  @Column({ name: 'target_type' })
  targetType: 'user' | 'post' | 'group';

  @Column({ name: 'target_id' })
  targetId: string;

  @Column()
  reason: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'resolved' | 'dismissed';

  @Column({ name: 'reviewed_by_admin_id', nullable: true })
  reviewedByAdminId: string;

  @Column({
    name: 'action_taken',
    type: 'enum',
    enum: ContentAction,
    default: ContentAction.NONE,
  })
  actionTaken: ContentAction;

  @Column({ name: 'admin_note', type: 'text', nullable: true })
  adminNote: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
