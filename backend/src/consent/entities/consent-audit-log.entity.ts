import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ConsentAuditAction {
  REQUESTED = 'requested',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('consent_audit_logs')
export class ConsentAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'consent_request_id' })
  consentRequestId: string;

  @Column({ type: 'enum', enum: ConsentAuditAction })
  action: ConsentAuditAction;

  @Column({ name: 'actor_user_id' })
  actorUserId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;
}
