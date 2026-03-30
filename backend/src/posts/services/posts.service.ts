import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
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
    return this.postsRepo.save(post);
  }

  async findByGroup(groupId: string, page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      where: { group: { id: groupId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // Admin: list all posts across all groups
  async findAll(page: number, limit: number) {
    const [data, total] = await this.postsRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['group', 'user'],
    });
    return { data, total };
  }

  async delete(postId: string) {
    await this.postsRepo.delete(postId);
  }
}
