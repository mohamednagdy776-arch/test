import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2_id' })
  user2: User;

  @Column({ type: 'float', default: 0 })
  score: number;

  // Per-dimension sub-scores from the AI service (religious/lifestyle/interests/
  // location/other, 0-100). Stored so the client shows a real breakdown instead
  // of fabricating bars from the single score (#741).
  @Column({ type: 'jsonb', nullable: true })
  breakdown: Record<string, number> | null;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected' | 'chat';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
