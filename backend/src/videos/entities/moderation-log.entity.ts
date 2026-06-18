import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('video_moderation_logs')
export class VideoModerationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'video_id' })
  videoId: string;

  @Column({ name: 'admin_id', nullable: true })
  adminId: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;
}
