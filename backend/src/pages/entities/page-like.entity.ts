import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Page } from './page.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('page_likes')
@Unique(['page', 'user'])
export class PageLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'liked_at' })
  likedAt: Date;
}