import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Profile } from '../../users/entities/profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'account_type', default: 'user' })
  accountType: 'user' | 'guardian' | 'agent' | 'admin';

  @Column({ default: 'pending' })
  status: 'active' | 'pending' | 'banned';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => Profile, profile => profile.user)
  profile: Profile;
}
