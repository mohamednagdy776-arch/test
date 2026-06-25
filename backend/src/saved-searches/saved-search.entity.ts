import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// A saved search filter set (#757). `filters` is the opaque query object the
// search UI replays (city, age range, sect, etc.).
@Entity('saved_searches')
export class SavedSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', default: {} })
  filters: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
