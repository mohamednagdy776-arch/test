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
    const saved = await this.postsRepo.save(post);
    // Reload with relations for the response
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
      relations: ['user', 'group'],
    });
  }
}
