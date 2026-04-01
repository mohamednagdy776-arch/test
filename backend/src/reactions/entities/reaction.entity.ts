import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('reactions')
@Unique(['post', 'user'])
export class Reaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ default: 'like' })
  type: string; // 'like' | 'love' | 'support'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
