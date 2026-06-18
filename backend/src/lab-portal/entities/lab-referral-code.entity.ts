import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lab_referral_codes')
export class LabReferralCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'lab_id' })
  labId: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'used_at', nullable: true, type: 'timestamp' })
  usedAt: Date;

  @Column({ name: 'result_id', nullable: true })
  resultId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
