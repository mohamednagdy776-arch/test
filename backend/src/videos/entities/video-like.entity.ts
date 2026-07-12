import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Video } from './video.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('video_likes')
@Unique(['video', 'user'])
export class VideoLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Only ever implied 'like' with no way to record which reaction type was
  // picked, unlike posts which support multiple (#151).
  @Column({ default: 'like' })
  type: string;

  @CreateDateColumn({ name: 'liked_at' })
  likedAt: Date;
}
