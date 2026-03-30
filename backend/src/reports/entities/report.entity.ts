import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reportedBy: User;

  @Column({ name: 'target_type' })
  targetType: 'user' | 'post' | 'group';

  @Column({ name: 'target_id' })
  targetId: string;

  @Column()
  reason: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'resolved' | 'dismissed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
