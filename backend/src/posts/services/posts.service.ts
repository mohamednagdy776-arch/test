import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, LessThan, LessThanOrEqual, IsNull, MoreThan } from 'typeorm';
import { Post, PostType } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { User } from '../../auth/entities/user.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { LinkPreviewService } from '../../link-preview/link-preview.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private notifications: NotificationsService,
    private linkPreview: LinkPreviewService,
  ) {}

  async create(groupId: string, dto: CreatePostDto, user: User) {
    const linkFields = await this.resolveLinkPreview(dto);
    const { noLinkPreview, ...rest } = dto;
    const post = this.postsRepo.create({
      ...rest,
      ...linkFields,
      group: { id: groupId } as any,
      user,
    });
    const saved = await this.postsRepo.save(post);
    return this.postsRepo.findOne({
      where: { id: (saved as any).id },
      relations: ['user', 'group'],
    });
  }

  // If the author didn't supply link metadata, detect the first URL in the body
  // and fetch its Open Graph preview so PostCard can render a rich card (#link).
  private async resolveLinkPreview(dto: CreatePostDto): Promise<Partial<Post>> {
    // Client already supplied a preview, or explicitly removed it.
    if (dto.linkUrl || dto.noLinkPreview) return {};
    const url = this.linkPreview.extractFirstUrl(dto.content);
    if (!url) return {};
    const preview = await this.linkPreview.getPreview(url);
    if (!preview) return {};
    return {
      linkUrl: preview.url,
      linkTitle: preview.title,
      linkDescription: preview.description,
      linkImage: preview.image,
    };
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

  async getFeed(page: number, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.group', 'group')
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      .orderBy('post.isPinned', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    this.applyAudienceFilter(qb, viewerId);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async getRecentFeed(page: number, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.group', 'group')
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    this.applyAudienceFilter(qb, viewerId);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async getFeedByCursor(cursor: string | undefined, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.group', 'group')
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      .orderBy('post.isPinned', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .take(limit + 1);
    if (cursor) {
      qb.andWhere('post.created_at < :cursor', { cursor: new Date(cursor) });
    }
    this.applyAudienceFilter(qb, viewerId);
    const data = await qb.getMany();
    const hasMore = data.length > limit;
    const results = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? results[results.length - 1]?.createdAt?.toISOString() : undefined;
    return { data: results, nextCursor, hasMore };
  }

  async getRecentFeedByCursor(cursor: string | undefined, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.group', 'group')
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);
    if (cursor) {
      qb.andWhere('post.createdAt < :cursor', { cursor: new Date(cursor) });
    }
    this.applyAudienceFilter(qb, viewerId);
    const data = await qb.getMany();
    const hasMore = data.length > limit;
    const results = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? results[results.length - 1]?.createdAt?.toISOString() : undefined;
    return { data: results, nextCursor, hasMore };
  }

  private applyAudienceFilter(qb: SelectQueryBuilder<Post>, viewerId?: string) {
    if (viewerId) {
      qb.andWhere(`(
        post.user_id = :viewerId
        OR post.audience = 'public'
        OR (
          post.audience IN ('friends', 'friends_of_friends')
          AND EXISTS (
            SELECT 1 FROM friendships f
            WHERE f.status = 'accepted'
            AND f.deleted_at IS NULL
            AND (
              (f.requester_id = post.user_id AND f.addressee_id = :viewerId)
              OR (f.addressee_id = post.user_id AND f.requester_id = :viewerId)
            )
          )
        )
      )`, { viewerId });
    } else {
      qb.andWhere("post.audience = 'public'");
    }
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

    if (post.userId === viewerId) return post;

    if (post.audience === 'only_me') {
      throw new NotFoundException('Post not found');
    }

    if (post.audience === 'friends' || post.audience === 'friends_of_friends') {
      const rows = await this.postsRepo.manager.query(
        `SELECT 1 FROM friendships f
         WHERE f.status = 'accepted' AND f.deleted_at IS NULL
         AND (
           (f.requester_id = $1 AND f.addressee_id = $2)
           OR (f.addressee_id = $1 AND f.requester_id = $2)
         ) LIMIT 1`,
        [post.userId, viewerId],
      );
      if (!rows.length) throw new NotFoundException('Post not found');
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

  async unsavePost(postId: string, userId: string) {
    await this.postsRepo.manager.query(
      `UPDATE saved_posts SET deleted_at = NOW()
       WHERE user_id = $1 AND post_id = $2 AND deleted_at IS NULL`,
      [userId, postId],
    );
    return { saved: false };
  }

  async getSavedPosts(userId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepo
      .createQueryBuilder('post')
      .innerJoin('saved_posts', 'sp', 'sp.post_id = post.id AND sp.deleted_at IS NULL')
      .where('sp.user_id = :userId', { userId })
      .orderBy('sp.saved_at', 'DESC')
      // Use offset/limit, not skip/take: skip/take triggers TypeORM's
      // entity-aware distinct pagination, which tried to resolve the raw join
      // alias `sp.saved_at` against entity metadata and threw
      // "Cannot read properties of undefined (reading 'databaseName')" (#746).
      .offset((page - 1) * limit)
      .limit(limit)
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