import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('affiliates')
export class Affiliate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'referral_code', unique: true })
  referralCode: string;

  @Column({ name: 'total_referred', default: 0 })
  totalReferred: number;

  @Column({ name: 'total_marriages', default: 0 })
  totalMarriages: number;

  @Column({ name: 'commission_balance', type: 'decimal', default: 0 })
  commissionBalance: number;
}
