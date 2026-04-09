import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export type SavedEntityType = 'post' | 'comment' | 'video' | 'story';

@Entity('saved_items')
@Unique(['user', 'entityType', 'entityId'])
export class SavedItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'entity_type' })
  entityType: SavedEntityType;

  @Column({ name: 'entity_id' })
  entityId: string;

  @CreateDateColumn({ name: 'saved_at' })
  savedAt: Date;
}