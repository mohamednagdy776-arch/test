import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../entities/page.entity';
import { PageFollower } from '../entities/page-follower.entity';
import { PageLike } from '../entities/page-like.entity';
import { Post } from '../../posts/entities/post.entity';
import { StoriesService } from '../../posts/services/stories.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page) private pagesRepo: Repository<Page>,
    @InjectRepository(PageFollower) private followerRepo: Repository<PageFollower>,
    @InjectRepository(PageLike) private likeRepo: Repository<PageLike>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private storiesService: StoriesService,
  ) {}

  async create(dto: CreatePageDto, user: User) {
    const username = dto.name.toLowerCase().replace(/\s+/g, '-');
    const page = this.pagesRepo.create({ ...dto, username, createdBy: user });
    const saved = await this.pagesRepo.save(page);
    await this.followerRepo.save(this.followerRepo.create({
      page: { id: saved.id } as any,
      user,
    }));
    return saved;
  }

  // No update path existed at all -- the create-only API meant a page's cover
  // photo, avatar, and other details could never be changed after creation,
  // and the frontend's already-wired edit modal (PATCH /pages/:id) 404'd (#372).
  async update(pageId: string, userId: string, dto: UpdatePageDto) {
    const page = await this.pagesRepo.findOne({ where: { id: pageId }, relations: ['createdBy'] });
    if (!page) throw new NotFoundException('Page not found');
    if (page.createdBy?.id !== userId) throw new ForbiddenException('Only the page owner can edit this page');
    Object.assign(page, dto);
    return this.pagesRepo.save(page);
  }

  async search(q: string) {
    const query = q.trim();
    if (!query) return [];
    const rows = await this.pagesRepo
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.createdBy', 'createdBy')
      .where('page.name ILIKE :q', { q: `%${query}%` })
      .orderBy('page.createdAt', 'DESC')
      .take(20)
      .getMany();
    const withCounts = await this.attachCounts(rows);
    return withCounts.map((p) => ({ ...p, ownerId: p.createdBy?.id ?? null }));
  }

  async findAll(page: number, limit: number) {
    const [rows, total] = await this.pagesRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    const withCounts = await this.attachCounts(rows);
    const data = withCounts.map((p) => ({
      ...p,
      ownerId: p.createdBy?.id ?? null,
    }));
    return { data, total };
  }

  // Batched follower/like counts for a list of pages. Two grouped queries
  // instead of N+1, matching the followerCount/likeCount fields findOne returns.
  private async attachCounts<T extends { id: string }>(
    pages: T[],
  ): Promise<(T & { followerCount: number; likeCount: number })[]> {
    if (pages.length === 0) return [];
    const ids = pages.map((p) => p.id);
    const followerRows = await this.followerRepo
      .createQueryBuilder('f')
      .select('f.page_id', 'pageId')
      .addSelect('COUNT(*)', 'count')
      .where('f.page_id IN (:...ids)', { ids })
      .groupBy('f.page_id')
      .getRawMany();
    const likeRows = await this.likeRepo
      .createQueryBuilder('l')
      .select('l.page_id', 'pageId')
      .addSelect('COUNT(*)', 'count')
      .where('l.page_id IN (:...ids)', { ids })
      .groupBy('l.page_id')
      .getRawMany();
    const followerMap = new Map<string, number>(
      followerRows.map((r) => [r.pageId, Number(r.count)]),
    );
    const likeMap = new Map<string, number>(
      likeRows.map((r) => [r.pageId, Number(r.count)]),
    );
    return pages.map((p) => ({
      ...p,
      followerCount: followerMap.get(p.id) ?? 0,
      likeCount: likeMap.get(p.id) ?? 0,
    }));
  }

  async findOne(pageId: string, userId?: string) {
    // `createdBy` wasn't loaded and `isOwner` was never computed at all -- the
    // frontend's owner-only post composer, edit button, and delete button are
    // all gated on `isOwner`, so none of them ever rendered for anyone,
    // including the actual creator (#372, #373).
    const page = await this.pagesRepo.findOne({ where: { id: pageId }, relations: ['createdBy'] });
    if (!page) throw new NotFoundException('Page not found');
    const followerCount = await this.getFollowerCount(pageId);
    const likeCount = await this.getLikeCount(pageId);
    let isFollowing = false;
    let isLiked = false;
    let isOwner = false;
    if (userId) {
      isFollowing = await this.isFollowing(pageId, userId);
      isLiked = await this.isLiked(pageId, userId);
      isOwner = page.createdBy?.id === userId;
    }
    return { ...page, followerCount, likeCount, isFollowing, isLiked, isOwner };
  }

  async findByUsername(username: string, userId?: string) {
    const page = await this.pagesRepo.findOne({ where: { username } });
    if (!page) throw new NotFoundException('Page not found');
    return this.findOne(page.id, userId);
  }

  async follow(pageId: string, user: User) {
    const page = await this.pagesRepo.findOne({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');
    const existing = await this.followerRepo.findOne({
      where: { page: { id: pageId }, user: { id: user.id } },
    });
    if (existing) throw new ConflictException('Already following');
    await this.followerRepo.save(this.followerRepo.create({
      page: { id: pageId } as any,
      user,
    }));
    return page;
  }

  async unfollow(pageId: string, userId: string) {
    const follower = await this.followerRepo.findOne({
      where: { page: { id: pageId }, user: { id: userId } },
    });
    if (!follower) throw new NotFoundException('Not following');
    await this.followerRepo.delete(follower.id);
  }

  async like(pageId: string, user: User) {
    const page = await this.pagesRepo.findOne({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');
    const existing = await this.likeRepo.findOne({
      where: { page: { id: pageId }, user: { id: user.id } },
    });
    if (existing) throw new ConflictException('Already liked');
    await this.likeRepo.save(this.likeRepo.create({
      page: { id: pageId } as any,
      user,
    }));
    return page;
  }

  async unlike(pageId: string, userId: string) {
    const like = await this.likeRepo.findOne({
      where: { page: { id: pageId }, user: { id: userId } },
    });
    if (!like) throw new NotFoundException('Not liked');
    await this.likeRepo.delete(like.id);
  }

  async getMyPages(userId: string) {
    const follows = await this.followerRepo.find({
      where: { user: { id: userId } },
      relations: ['page'],
      order: { followedAt: 'DESC' },
    });
    return this.attachCounts(follows.map(f => f.page));
  }

  async isFollowing(pageId: string, userId: string): Promise<boolean> {
    const count = await this.followerRepo.count({
      where: { page: { id: pageId }, user: { id: userId } },
    });
    return count > 0;
  }

  async isLiked(pageId: string, userId: string): Promise<boolean> {
    const count = await this.likeRepo.count({
      where: { page: { id: pageId }, user: { id: userId } },
    });
    return count > 0;
  }

  // Pages created by the user (the FE "created" tab).
  async getCreated(userId: string) {
    const pages = await this.pagesRepo.find({
      where: { createdBy: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    return this.attachCounts(pages);
  }

  // Public pages the user does not already follow.
  async getSuggested(userId: string, limit: number) {
    const follows = await this.followerRepo.find({
      where: { user: { id: userId } },
      relations: ['page'],
    });
    const followed = new Set(follows.map((f) => f.page.id));
    const pages = await this.pagesRepo.find({
      where: { privacy: 'public' },
      order: { createdAt: 'DESC' },
      take: limit + followed.size,
    });
    const suggested = pages.filter((p) => !followed.has(p.id)).slice(0, limit);
    return this.attachCounts(suggested);
  }

  // Posts were never actually associated to pages (posts only had a user/group
  // relation) -- the composer had no backend endpoint to save to and this
  // always returned an empty stub regardless of what existed (#373). Now
  // backed by the real page_id column added in migration 027.
  async getPosts(pageId: string, page: number, limit: number) {
    const exists = await this.pagesRepo.count({ where: { id: pageId } });
    if (!exists) throw new NotFoundException('Page not found');
    const [data, total] = await this.postsRepo.findAndCount({
      where: { page: { id: pageId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'user.profile', 'page'],
    });
    return { data, total };
  }

  // Only the page's creator/owner can post as the page (#373).
  async createPost(pageId: string, userId: string, content: string) {
    const page = await this.pagesRepo.findOne({ where: { id: pageId }, relations: ['createdBy'] });
    if (!page) throw new NotFoundException('Page not found');
    if (page.createdBy?.id !== userId) throw new ForbiddenException('Only the page owner can post');
    return this.storiesService.createPost(userId, { content, pageId });
  }

  async getFollowerCount(pageId: string): Promise<number> {
    return this.followerRepo.count({ where: { page: { id: pageId } } });
  }

  async getLikeCount(pageId: string): Promise<number> {
    return this.likeRepo.count({ where: { page: { id: pageId } } });
  }

  async verify(pageId: string) {
    const page = await this.pagesRepo.findOne({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');
    page.isVerified = true;
    return this.pagesRepo.save(page);
  }

  async adminDelete(pageId: string) {
    const page = await this.pagesRepo.findOne({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');
    await this.pagesRepo.delete(pageId);
  }
}