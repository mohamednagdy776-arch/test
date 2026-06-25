import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../auth/entities/user.entity';

export type IdentityVerificationStatus = 'pending' | 'approved' | 'rejected';

// An identity/photo (KYC) verification submission (#755). The uploaded document
// URLs are sensitive — @Exclude them from normal serialization so they only ever
// reach the admin review flow, never a profile response.
@Entity('identity_verifications')
export class IdentityVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Exclude()
  @Column({ name: 'selfie_url' })
  selfieUrl: string;

  @Exclude()
  @Column({ name: 'id_document_url' })
  idDocumentUrl: string;

  @Column({ default: 'pending' })
  status: IdentityVerificationStatus;

  @Column({ name: 'reviewed_by_admin_id', nullable: true })
  reviewedByAdminId: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
