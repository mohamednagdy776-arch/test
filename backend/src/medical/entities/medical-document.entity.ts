import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, DeleteDateColumn } from 'typeorm';

export enum DocumentType {
  BLOOD_TEST = 'blood_test',
  GENETIC_REPORT = 'genetic_report',
  MEDICAL_HISTORY = 'medical_history',
  OTHER = 'other',
}

export enum UploadStatus {
  PENDING = 'pending',
  SCANNING = 'scanning',
  READY = 'ready',
  REJECTED = 'rejected',
}

@Entity('medical_documents')
export class MedicalDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'encrypted_s3_key' })
  encryptedS3Key: string;

  @Column({ name: 'encrypted_dek' })
  encryptedDek: string;

  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ name: 'checksum_sha256', nullable: true })
  checksumSha256: string;

  @Column({ name: 'upload_status', type: 'enum', enum: UploadStatus, default: UploadStatus.PENDING })
  uploadStatus: UploadStatus;

  @Column({ name: 'ai_processed', default: false })
  aiProcessed: boolean;

  @Column({ name: 'processing_result_encrypted', nullable: true })
  processingResultEncrypted: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
