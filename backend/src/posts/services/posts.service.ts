import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Post, PostType } from '../entities/post.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
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

  async getFeed(page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      order: { isPinned: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });
    return { data, total };
  }

  async getRecentFeed(page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'group'],
    });
    return { data, total };
  }

  async delete(postId: string) {
    await this.postsRepo.delete(postId);
  }

  async findById(postId: string) {
    return this.postsRepo.findOne({
      where: { id: postId },
      relations: ['user', 'group', 'originalPost', 'originalPost.user'],
    });
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
    const saved = await this.postsRepo.manager.query(
      `INSERT INTO saved_posts (user_id, post_id, created_at) VALUES ($1, $2, NOW()) ON CONFLICT DO NOTHING`,
      [userId, postId],
    );
    return { saved: true };
  }

  async getSavedPosts(userId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepo
      .createQueryBuilder('post')
      .innerJoin('saved_posts', 'sp', 'sp.post_id = post.id')
      .where('sp.user_id = :userId', { userId })
      .orderBy('sp.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async getScheduledPosts(userId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      where: { userId, scheduledAt: LessThan(new Date()) },
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

    const shared = this.postsRepo.create({
      content: content || '',
      postType: PostType.SHARED,
      originalPostId: postId,
      user: { id: userId } as any,
    });
    return this.postsRepo.save(shared);
  }

  async toggleComments(postId: string, userId: string, disabled: boolean) {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('Not authorized');

    post.commentsDisabled = disabled;
    return this.postsRepo.save(post);
  }
}