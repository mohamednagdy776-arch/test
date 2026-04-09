import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Group } from '../../groups/entities/group.entity';
import { User } from '../../auth/entities/user.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum PostType {
  TEXT = 'text',
  PHOTO = 'photo',
  VIDEO = 'video',
  LINK = 'link',
  SHARED = 'shared',
  EVENT = 'event',
  CHECKIN = 'checkin',
  POLL = 'poll',
  FEELING = 'feeling',
}

export enum Audience {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  FRIENDS_OF_FRIENDS = 'friends_of_friends',
  ONLY_ME = 'only_me',
  CUSTOM = 'custom',
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'text', default: '' })
  content: string;

  @Column({ name: 'media_url', nullable: true })
  mediaUrl: string;

  @Column({ name: 'media_type', nullable: true })
  mediaType: string;

  @Column({ name: 'media_urls', type: 'text', array: true, nullable: true })
  mediaUrls: string[];

  @Column({ type: 'enum', enum: PostType, default: PostType.TEXT })
  postType: PostType;

  @Column({ type: 'enum', enum: Audience, default: Audience.FRIENDS })
  audience: Audience;

  @Column({ name: 'bg_color', nullable: true })
  bgColor: string;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'comments_disabled', default: false })
  commentsDisabled: boolean;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  feeling: string;

  @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
  editedAt: Date;

  @Column({ name: 'link_url', nullable: true })
  linkUrl: string;

  @Column({ name: 'link_title', nullable: true })
  linkTitle: string;

  @Column({ name: 'link_description', nullable: true })
  linkDescription: string;

  @Column({ name: 'link_image', nullable: true })
  linkImage: string;

  @Column({ name: 'poll_options', type: 'jsonb', nullable: true })
  pollOptions: { text: string; votes: number }[];

  @Column({ name: 'original_post_id', nullable: true })
  originalPostId: string;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ name: 'original_post_id' })
  originalPost: Post;

  @OneToMany(() => Reaction, reaction => reaction.post)
  reactions: Reaction[];

  @OneToMany(() => Comment, comment => comment.post)
  comments: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
