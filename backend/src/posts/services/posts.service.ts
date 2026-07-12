import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, LessThanOrEqual, IsNull, MoreThan } from 'typeorm';
import { Post, PostType } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { User } from '../../auth/entities/user.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { LinkPreviewService } from '../../link-preview/link-preview.service';
import { applyAudienceFilter, applyHiddenFilter } from '../utils/post-visibility.util';

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
      relations: ['user', 'user.profile', 'group'],
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
      relations: ['user', 'user.profile', 'group'],
    });
    return { data, total };
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['group', 'user', 'user.profile'],
    });
    return { data, total };
  }

  async getFeed(page: number, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .leftJoinAndSelect('post.group', 'group')
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      .orderBy('post.isPinned', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    applyAudienceFilter(qb, viewerId);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async getRecentFeed(page: number, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .leftJoinAndSelect('post.group', 'group')
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    applyAudienceFilter(qb, viewerId);
    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async getFeedByCursor(cursor: string | undefined, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .leftJoinAndSelect('post.group', 'group')
      // Embed the original on shared/reposted posts so PostCard can render the
      // source author + content/media instead of just the added text (#21).
      .leftJoinAndSelect('post.originalPost', 'originalPost')
      .leftJoinAndSelect('originalPost.user', 'originalPostUser')
      .leftJoinAndSelect('originalPostUser.profile', 'originalPostUserProfile')
      // Engagement (reactions + live comments) as a selected alias we can ORDER
      // BY. A raw subquery passed straight to orderBy with .take() made TypeORM's
      // distinct-pagination misparse it as an alias and 500 the feed; ordering by
      // a named addSelect with .limit() (safe — every join here is many-to-one)
      // avoids that.
      .addSelect(
        '(SELECT COUNT(*) FROM reactions r WHERE r.post_id = post.id) + (SELECT COUNT(*) FROM comments c WHERE c.post_id = post.id AND c.deleted_at IS NULL)',
        'engagement',
      )
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      // "Most Relevant" ranks by real engagement so this feed differs from the
      // chronological /feed/recent (#16). Pinned first.
      .orderBy('post.isPinned', 'DESC')
      .addOrderBy('engagement', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .limit(limit + 1);
    if (cursor) {
      qb.andWhere('post.created_at < :cursor', { cursor: new Date(cursor) });
    }
    applyHiddenFilter(qb, viewerId);
    applyAudienceFilter(qb, viewerId);
    const data = await qb.getMany();
    const hasMore = data.length > limit;
    const results = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? results[results.length - 1]?.createdAt?.toISOString() : undefined;
    return { data: this.sanitizePolls(results, viewerId), nextCursor, hasMore };
  }

  async getRecentFeedByCursor(cursor: string | undefined, limit: number, viewerId?: string) {
    const now = new Date();
    const qb = this.postsRepo.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('user.profile', 'userProfile')
      .leftJoinAndSelect('post.group', 'group')
      .leftJoinAndSelect('post.originalPost', 'originalPost')
      .leftJoinAndSelect('originalPost.user', 'originalPostUser')
      .leftJoinAndSelect('originalPostUser.profile', 'originalPostUserProfile')
      .andWhere('(post.scheduled_at IS NULL OR post.scheduled_at <= :now)', { now })
      .orderBy('post.createdAt', 'DESC')
      .take(limit + 1);
    if (cursor) {
      qb.andWhere('post.createdAt < :cursor', { cursor: new Date(cursor) });
    }
    applyHiddenFilter(qb, viewerId);
    applyAudienceFilter(qb, viewerId);
    const data = await qb.getMany();
    const hasMore = data.length > limit;
    const results = hasMore ? data.slice(0, limit) : data;
    const nextCursor = hasMore ? results[results.length - 1]?.createdAt?.toISOString() : undefined;
    return { data: this.sanitizePolls(results, viewerId), nextCursor, hasMore };
  }

  // The feed returned pollOptions straight off the entity, `voterIds` and all —
  // every viewer could see who voted for what, and the client had no way to
  // know which option (if any) THEY picked, so the poll always rendered
  // unselected on a fresh page load (#167). Strip voterIds for privacy, but
  // surface the viewer's own pick as `myVote`.
  private sanitizePolls<T extends { pollOptions?: { text: string; votes: number; voterIds?: string[] }[] }>(
    posts: T[],
    viewerId?: string,
  ): T[] {
    return posts.map((post) => {
      if (!post.pollOptions) return post;
      const myVote = viewerId
        ? post.pollOptions.findIndex((o) => Array.isArray(o.voterIds) && o.voterIds.includes(viewerId))
        : -1;
      return {
        ...post,
        pollOptions: post.pollOptions.map(({ text, votes }) => ({ text, votes })),
        myVote: myVote >= 0 ? myVote : null,
      } as T;
    });
  }

  // Exclude posts the viewer hid ("not interested") or snoozed (until the snooze
  // window lapses). hidden_posts is written by StoriesService.hidePost, but the
  // user-facing feed runs through this service, so it must honour those rows too
  // — otherwise hidden posts reappear on the next refetch (#15).
  // (moved to ../utils/post-visibility.util.ts so FeedService's separate
  // Trending Posts query can share it instead of drifting out of sync — see
  // that file's header comment re #288.)

  // Admin-only hard delete (route is guarded by @Roles('admin')). User-facing
  // deletion goes through softDelete(), which enforces ownership.
  async delete(postId: string) {
    await this.postsRepo.delete(postId);
  }

  async findById(postId: string, viewerId?: string) {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['user', 'user.profile', 'group', 'originalPost', 'originalPost.user', 'originalPost.user.profile'],
    });
    if (!post) throw new NotFoundException('Post not found');
    // A deactivated/deleted author is excluded from the relation join (comes
    // back as `user: null`), not surfaced as `isDeactivated: true` — check for
    // both so the post 404s instead of rendering with a null author (#149).
    if (!post.user || post.user.isDeactivated) throw new NotFoundException('Post not found');

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

    // Unlike the feed listings, this single-post fetch skipped sanitizePolls
    // entirely -- it leaked every voter's identity via raw voterIds AND never
    // told the viewer which option they'd picked, so a poll always rendered
    // unselected/un-voted when opened directly (permalink, watch page, etc) (#167).
    return this.sanitizePolls([post], viewerId)[0];
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
      relations: ['user', 'user.profile', 'group'],
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
    // Sharing your own post just creates a duplicate in the feed (#100).
    if (original.userId === userId) {
      throw new ForbiddenException('You cannot share your own post');
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