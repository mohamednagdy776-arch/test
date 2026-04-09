import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('stories')
export class Story {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'media_url', nullable: true })
  mediaUrl: string;

  @Column({ name: 'media_type', nullable: true })
  mediaType: 'image' | 'video';

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  text: string;

  @Column({ name: 'bg_color', nullable: true })
  bgColor: string;

  @Column({ name: 'duration', default: 5 })
  duration: number;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @OneToMany('StoryView', 'story')
  views: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('story_views')
export class StoryView {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Story, story => story.views, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'story_id' })
  story: Story;

  @Column({ name: 'story_id' })
  storyId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt: Date;
}

@Entity('story_highlights')
export class StoryHighlight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column({ name: 'cover_url', nullable: true })
  coverUrl: string;

  @Column({ name: 'story_ids', type: 'text', array: true, default: '{}' })
  storyIds: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('saved_posts')
export class SavedPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('Post')
  @JoinColumn({ name: 'post_id' })
  post: any;

  @Column({ name: 'post_id' })
  postId: string;

  @CreateDateColumn({ name: 'saved_at' })
  savedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

@Entity('post_reports')
export class PostReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ name: 'reporter_id' })
  reporterId: string;

  @ManyToOne('Post')
  @JoinColumn({ name: 'post_id' })
  post: any;

  @Column({ name: 'post_id' })
  postId: string;

  @Column()
  reason: string;

  @Column({ name: 'description', nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'reviewed' | 'resolved';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('hidden_posts')
export class HiddenPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne('Post')
  @JoinColumn({ name: 'post_id' })
  post: any;

  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'hide_type', default: 'not_interested' })
  hideType: 'not_interested' | 'snooze' | 'unfollow';

  @Column({ name: 'snooze_until', type: 'timestamp', nullable: true })
  snoozeUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}