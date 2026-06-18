import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum VideoJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('video_jobs')
export class VideoJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reel_id' })
  reelId: string;

  @Column({ type: 'enum', enum: VideoJobStatus, default: VideoJobStatus.QUEUED })
  status: VideoJobStatus;

  @Column({ name: 'input_s3_key', nullable: true })
  inputS3Key: string;

  @Column({ name: 'output_s3_key_480p', nullable: true })
  outputS3Key480p: string;

  @Column({ name: 'output_s3_key_720p', nullable: true })
  outputS3Key720p: string;

  @Column({ name: 'thumbnail_s3_key', nullable: true })
  thumbnailS3Key: string;

  @Column({ name: 'error_message', nullable: true, type: 'text' })
  errorMessage: string;

  @Column({ name: 'retry_count', default: 0 })
  retryCount: number;

  @Column({ name: 'processing_started_at', nullable: true, type: 'timestamp' })
  processingStartedAt: Date;

  @Column({ name: 'completed_at', nullable: true, type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
