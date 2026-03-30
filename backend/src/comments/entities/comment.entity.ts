import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Self-referencing for nested replies — null means top-level comment
  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment | null;

  @Column()
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
