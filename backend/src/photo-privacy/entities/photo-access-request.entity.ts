import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type PhotoAccessStatus = 'pending' | 'approved' | 'denied';

// A request from one user to view another's private/on-request photos (#752).
@Entity('photo_access_requests')
@Unique('uq_photo_access_pair', ['requesterId', 'ownerId'])
export class PhotoAccessRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @Column({ name: 'requester_id' })
  requesterId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Index()
  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ default: 'pending' })
  status: PhotoAccessStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
