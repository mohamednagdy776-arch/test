import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LabStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('labs')
export class Lab {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'commercial_registration', nullable: true })
  commercialRegistration: string;

  @Column({ type: 'enum', enum: LabStatus, default: LabStatus.PENDING })
  status: LabStatus;

  @Column({ name: 'api_key_hash', nullable: true })
  apiKeyHash: string;

  @Column({ name: 'webhook_endpoint', nullable: true })
  webhookEndpoint: string;

  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contractStartDate: Date;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate: Date;

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  commissionRate: number;

  @Column({ name: 'integration_active', default: false })
  integrationActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
