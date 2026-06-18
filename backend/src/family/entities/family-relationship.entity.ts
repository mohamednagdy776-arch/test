import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  BROTHER = 'brother',
  WALI = 'wali',
}

export enum RelationshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REVOKED = 'revoked',
}

@Entity('family_relationships')
export class FamilyRelationship {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'guardian_user_id' })
  guardianUserId: string;

  @Column({ name: 'ward_user_id' })
  wardUserId: string;

  @Column({ type: 'enum', enum: RelationshipType })
  relationshipType: RelationshipType;

  @Column({
    type: 'enum',
    enum: RelationshipStatus,
    default: RelationshipStatus.PENDING,
  })
  status: RelationshipStatus;

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    view_matches?: boolean;
    approve_matches?: boolean;
    view_activity_summary?: boolean;
    revoke_sessions?: boolean;
    receive_alerts?: boolean;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'accepted_at', nullable: true, type: 'timestamp' })
  acceptedAt: Date;
}
