import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column({ name: 'social_status', nullable: true })
  socialStatus: string;

  @Column({ name: 'children_count', default: 0 })
  childrenCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
