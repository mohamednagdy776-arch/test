import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('event_rsvps')
@Unique(['event', 'user'])
export class EventRSVP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 'going' })
  status: 'going' | 'interested' | 'not_going';

  @CreateDateColumn({ name: 'rsvped_at' })
  rsvpedAt: Date;
}