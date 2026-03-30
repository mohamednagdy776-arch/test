import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user1_id' })
  user1: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user2_id' })
  user2: User;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
