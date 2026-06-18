import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lab } from './lab.entity';

export enum LabUserRole {
  LAB_ADMIN = 'lab_admin',
  LAB_TECHNICIAN = 'lab_technician',
}

@Entity('lab_users')
export class LabUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lab_id' })
  labId: string;

  @ManyToOne(() => Lab)
  @JoinColumn({ name: 'lab_id' })
  lab: Lab;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: LabUserRole })
  role: LabUserRole;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
