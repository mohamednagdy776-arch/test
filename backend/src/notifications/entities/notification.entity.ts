import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  type: string;

  @Column()
  message: string;

  @Column({ name: 'read_status', default: false })
  readStatus: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
