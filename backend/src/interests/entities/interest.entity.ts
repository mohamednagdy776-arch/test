import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type InterestStatus = 'pending' | 'mutual' | 'withdrawn';

// A directed "Send Salam" — marriage-intent interest in a specific person,
// distinct from a friend request (#754). When both sides express interest the
// pair becomes `mutual`.
@Entity('interests')
@Unique('uq_interest_pair', ['senderId', 'receiverId'])
export class Interest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Index()
  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Index()
  @Column({ name: 'receiver_id' })
  receiverId: string;

  @Column({ default: 'pending' })
  status: InterestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
