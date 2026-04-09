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
    const [data, total] = await this.pagesRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
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
    return follows.map(f => f.page);
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

  async getFollowerCount(pageId: string): Promise<number> {
    return this.followerRepo.count({ where: { page: { id: pageId } } });
  }

  async getLikeCount(pageId: string): Promise<number> {
    return this.likeRepo.count({ where: { page: { id: pageId } } });
  }
}