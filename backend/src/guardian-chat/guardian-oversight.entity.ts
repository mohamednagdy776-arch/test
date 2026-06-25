import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../auth/entities/user.entity';

// A ward designating a guardian (wali) to oversee their matchmaking
// conversations — halal courtship oversight (#753). One active guardian per ward.
@Entity('guardian_oversights')
@Unique('uq_guardian_ward', ['wardId'])
export class GuardianOversight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'ward_id' })
  wardId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guardian_id' })
  guardian: User;

  @Index()
  @Column({ name: 'guardian_id' })
  guardianId: string;

  // 'awareness' = guardian sees who the ward is conversing with (metadata only).
  @Column({ default: 'awareness' })
  mode: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
