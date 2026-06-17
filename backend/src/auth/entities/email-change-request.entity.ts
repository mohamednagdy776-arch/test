import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Pending email-change request (#454). Kept in its own table so the heavily
// queried User entity is untouched — normal/auth queries are unaffected even
// before this table's migration runs.
@Entity('email_change_requests')
export class EmailChangeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'new_email' })
  newEmail: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
