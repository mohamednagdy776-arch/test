import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

// One row per (viewer, profile) pair, with the latest view time. Powers the
// "who viewed me" list (#754) without storing a row per page-load.
@Entity('profile_views')
export class ProfileView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'viewer_id' })
  viewer: User;

  @Column({ name: 'viewer_id' })
  viewerId: string;

  @Index()
  @Column({ name: 'profile_id' })
  profileId: string;

  @UpdateDateColumn({ name: 'viewed_at' })
  viewedAt: Date;
}
