import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ConsentType {
  MEDICAL_SHARE = 'medical_share',
  GENETIC_SHARE = 'genetic_share',
}

export enum ConsentStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('consent_requests')
export class ConsentRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requester_user_id' })
  requesterUserId: string;

  @Column({ name: 'target_user_id' })
  targetUserId: string;

  // DB column is snake_case `consent_type`; without this name mapping TypeORM
  // queried a nonexistent `"consentType"` column and every read 500'd (#747).
  @Column({ type: 'enum', enum: ConsentType, name: 'consent_type' })
  consentType: ConsentType;

  @Column({ type: 'enum', enum: ConsentStatus, default: ConsentStatus.PENDING })
  status: ConsentStatus;

  @CreateDateColumn({ name: 'requested_at' })
  requestedAt: Date;

  @Column({ name: 'responded_at', nullable: true })
  respondedAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt: Date;
}
