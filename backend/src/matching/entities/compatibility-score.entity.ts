import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('compatibility_scores')
@Unique(['userIdA', 'userIdB'])
export class CompatibilityScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id_a' })
  userIdA: string;

  @Column({ name: 'user_id_b' })
  userIdB: string;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: Record<string, number>;

  @Column({ name: 'model_version', default: 1 })
  modelVersion: number;

  @CreateDateColumn({ name: 'computed_at' })
  computedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;
}
