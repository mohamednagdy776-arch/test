import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../entities/page.entity';
import { PageFollower } from '../entities/page-follower.entity';
import { PageLike } from '../entities/page-like.entity';
import { CreatePageDto } from '../dto/create-page.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page) private pagesRepo: Repository<Page>,
    @InjectRepository(PageFollower) private followerRepo: Repository<PageFollower>,
    @InjectRepository(PageLike) private likeRepo: Repository<PageLike>,
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
    const page = await this.pagesRepo.findOne({ where: { id: pageId } });
    if (!page) throw new NotFoundException('Page not found');
    const followerCount = await this.getFollowerCount(pageId);
    const likeCount = await this.getLikeCount(pageId);
    let isFollowing = false;
    let isLiked = false;
    if (userId) {
      isFollowing = await this.isFollowing(pageId, userId);
      isLiked = await this.isLiked(pageId, userId);
    }
    return { ...page, followerCount, likeCount, isFollowing, isLiked };
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

  // Posts are not associated to pages in the current schema (posts belong to a
  // user/group only). Return an empty page rather than a 404 so the client
  // renders an empty feed. Validates the page exists first.
  async getPosts(pageId: string, _page: number, _limit: number) {
    const exists = await this.pagesRepo.count({ where: { id: pageId } });
    if (!exists) throw new NotFoundException('Page not found');
    return { data: [] as unknown[], total: 0 };
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