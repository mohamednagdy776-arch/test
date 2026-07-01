import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

// A "Report a Problem" support ticket submitted from Settings → Report (#50).
// Distinct from the moderation `reports` table (that one targets users/posts/
// groups); this captures free-form product/support feedback.
@Entity('support_reports')
export class SupportReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nullable so an unauthenticated submission can still be stored, but normally
  // set to the logged-in user who filed the ticket.
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  // bug | feature | account | privacy | other
  @Column()
  type: string;

  @Column({ type: 'text' })
  description: string;

  // Optional contact email the reporter typed (may differ from account email).
  @Column({ type: 'text', nullable: true })
  email: string | null;

  // Stored filenames of any uploaded screenshots/attachments (under uploads/support).
  @Column({ type: 'jsonb', nullable: true })
  attachments: string[] | null;

  @Column({ default: 'open' })
  status: 'open' | 'resolved' | 'dismissed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
