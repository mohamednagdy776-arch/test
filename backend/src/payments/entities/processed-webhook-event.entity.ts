import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('processed_webhook_events')
export class ProcessedWebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', unique: true })
  eventId: string;

  @Column()
  provider: string;

  @Column({ name: 'event_type' })
  eventType: string;

  @CreateDateColumn({ name: 'processed_at' })
  processedAt: Date;
}
