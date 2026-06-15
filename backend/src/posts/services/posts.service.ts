import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, IsNull, LessThanOrEqual } from 'typeorm';
import { Post, PostType } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { User } from '../../auth/entities/user.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private notifications: NotificationsService,
  ) {}

  async create(groupId: string, dto: CreatePostDto, user: User) {
    const post = this.postsRepo.create({
      ...dto,
      group: { id: groupId } as any,
      user,
    });
    const saved = await this.postsRepo.save(post);
    return this.postsRepo.findOne({
      where: { id: (saved as any).id },
      relations: ['user', 'group'],
    });
  }

  async findByGroup(groupId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      where: { group: { id: groupId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });
    return { data, total };
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['group', 'user'],
    });
    return { data, total };
  }

  // A scheduled post (scheduledAt in the future) must stay hidden from the feed
  // until its time arrives; posts with no schedule (null) are always visible.
  // Returned as an OR-array so it composes with the cursor filter below (#311).
  private scheduledVisible(extra: Record<string, any> = {}) {
    const now = new Date();
    return [
      { ...extra, scheduledAt: IsNull() },
      { ...extra, scheduledAt: LessThanOrEqual(now) },
    ];
  }

  async getFeed(page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      where: this.scheduledVisible(),
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });
    return { data, total };
  }

  async getRecentFeed(page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      where: this.scheduledVisible(),
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });
    return { data, total };
  }

  async getFeedByCursor(cursor: string | undefined, limit: number) {
    const whereCondition = this.scheduledVisible(cursor ? { createdAt: LessThan(new Date(cursor)) } : {});
    const data = await this.postsRepo.find({
      where: whereCondition,
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      take: limit + 1,
      relations: ['user', 'group'],
    });
    const hasMore = data.length > limit;
    const results = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? results[results.length - 1]?.createdAt?.toISOString() : undefined;
    return { data: results, nextCursor, hasMore };
  }

  async getRecentFeedByCursor(cursor: string | undefined, limit: number) {
    const whereCondition = this.scheduledVisible(cursor ? { createdAt: LessThan(new Date(cursor)) } : {});
    const data = await this.postsRepo.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      take: limit + 1,
      relations: ['user', 'group'],
    });
    const hasMore = data.length > limit;
    const results = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? results[results.length - 1]?.createdAt?.toISOString() : undefined;
    return { data: results, nextCursor, hasMore };
  }

  // Admin-only hard delete (route is guarded by @Roles('admin')). User-facing
  // deletion goes through softDelete(), which enforces ownership.
  async delete(postId: string) {
    await this.postsRepo.delete(postId);
  }

  async findById(postId: string, viewerId?: string) {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['user', 'group', 'originalPost', 'originalPost.user'],
    });
    if (!post) throw new NotFoundException('Post not found');

    // Audience enforcement: only_me posts are visible only to their author (5.11).
    if (post.audience === 'only_me' && post.userId !== viewerId) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(postId: string, dto: CreatePostDto, userId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');

    Object.assign(post, dto);
    post.editedAt = new Date();
    return this.postsRepo.save(post);
  }

  async softDelete(postId: string, userId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');
    await this.postsRepo.softDelete(postId);
  }

  async togglePin(postId: string, userId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');

    post.isPinned = !post.isPinned;
    return this.postsRepo.save(post);
  }

  async archive(postId: string, userId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');

    post.isArchived = true;
    return this.postsRepo.save(post);
  }

  async saveForLater(postId: string, userId: string) {
    // saved_posts columns: id (uuid PK), user_id, post_id, saved_at.
    // Insert only if not already saved (no composite unique constraint exists).
    await this.postsRepo.manager.query(
      `INSERT INTO saved_posts (id, user_id, post_id, saved_at)
       SELECT gen_random_uuid(), $1, $2, NOW()
       WHERE NOT EXISTS (
         SELECT 1 FROM saved_posts
         WHERE user_id = $1 AND post_id = $2 AND deleted_at IS NULL
       )`,
      [userId, postId],
    );
    return { saved: true };
  }

  async getSavedPosts(userId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepo
      .createQueryBuilder('post')
      .innerJoin('saved_posts', 'sp', 'sp.post_id = post.id AND sp.deleted_at IS NULL')
      .where('sp.user_id = :userId', { userId })
      .orderBy('sp.saved_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async getScheduledPosts(userId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      // Scheduled = still in the future. The old `LessThan(now)` returned
      // already-published posts.
      where: { userId, scheduledAt: MoreThan(new Date()) },
      order: { scheduledAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });
    return { data, total };
  }

  async share(postId: string, content: string, userId: string) {
    const original = await this.postsRepo.findOne({ where: { id: postId } });
    if (!original) throw new NotFoundException('Post not found');
    // Don't let a private (only_me) post be re-shared into a visible post.
    if (original.audience === 'only_me') {
      throw new ForbiddenException('Private posts cannot be shared');
    }

    const shared = this.postsRepo.create({
      content: content || '',
      postType: PostType.SHARED,
      originalPostId: postId,
      user: { id: userId } as any,
    });
    const saved = await this.postsRepo.save(shared);
    // Notify the original author that their post was shared (#445).
    await this.notifications.notifyUser(original.userId, userId, 'share', 'shared your post', 'post', postId);
    return saved;
  }

  async toggleComments(postId: string, userId: string, disabled: boolean) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');

    post.commentsDisabled = disabled;
    return this.postsRepo.save(post);
  }
}