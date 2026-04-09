import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type EventPrivacy = 'public' | 'friends' | 'private';
export type RSVPStatus = 'going' | 'interested' | 'not_going';
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'custom' | null;

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date | null;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  coverPhoto: string;

  @Column({ default: 'public' })
  privacy: EventPrivacy;

  @Column({ type: 'simple-array', nullable: true })
  coHosts: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  recurring: RecurringType;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}