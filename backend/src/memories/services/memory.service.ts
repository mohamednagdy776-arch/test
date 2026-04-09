import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

@Injectable()
export class MemoryService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
  ) {}

  async getMemories(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const posts = await this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.comments', 'comments')
      .where('post.user_id = :userId', { userId })
      .andWhere('post.createdAt >= :yearAgo', { yearAgo })
      .andWhere('EXTRACT(MONTH FROM post.createdAt) = :month', { month: now.getMonth() + 1 })
      .andWhere('EXTRACT(DAY FROM post.createdAt) = :day', { day: now.getDate() })
      .orderBy('post.createdAt', 'DESC')
      .getMany();

    return posts;
  }
}