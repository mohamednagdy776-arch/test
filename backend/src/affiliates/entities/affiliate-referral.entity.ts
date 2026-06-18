import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ReferralStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REVERSED = 'reversed',
}

export enum ConversionEvent {
  REGISTRATION = 'registration',
  SUBSCRIPTION = 'subscription',
}

@Entity('affiliate_referrals')
export class AffiliateReferral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'affiliate_id' })
  affiliateId: string;

  @Column({ name: 'referred_user_id' })
  referredUserId: string;

  @Column({ name: 'referral_code_used' })
  referralCodeUsed: string;

  @Column({ name: 'attribution_timestamp', type: 'timestamp' })
  attributionTimestamp: Date;

  @Column({
    name: 'conversion_event',
    type: 'enum',
    enum: ConversionEvent,
    nullable: true,
  })
  conversionEvent: ConversionEvent;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  commissionAmount: number;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @Column({ name: 'hold_until', type: 'timestamp', nullable: true })
  holdUntil: Date;

  @Column({ name: 'is_flagged', default: false })
  isFlagged: boolean;

  @Column({ name: 'flag_reason', nullable: true })
  flagReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
