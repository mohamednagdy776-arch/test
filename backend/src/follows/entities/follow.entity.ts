import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

// One-directional follow relationship. The unique constraint guarantees a user
// can follow another at most once (DB-level duplicate prevention, #379).
@Entity('follows')
@Unique('uq_follow_pair', ['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'follower_id' })
  follower: User;

  @Column({ name: 'follower_id' })
  followerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'following_id' })
  following: User;

  @Column({ name: 'following_id' })
  followingId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
