import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Page } from './page.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('page_followers')
@Unique(['page', 'user'])
export class PageFollower {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page: Page;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'followed_at' })
  followedAt: Date;
}