import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { SavedCollection } from './saved-collection.entity';

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

  @Column({ name: 'collection_id', nullable: true })
  collectionId: string;

  @ManyToOne(() => SavedCollection, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'collection_id' })
  collection: SavedCollection;

  @CreateDateColumn({ name: 'saved_at' })
  savedAt: Date;
}