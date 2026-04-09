import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedItem } from '../entities/saved-item.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedItem) private savedRepo: Repository<SavedItem>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async getSaved(userId: string) {
    const saved = await this.savedRepo.find({
      where: { user: { id: userId } },
      order: { savedAt: 'DESC' },
    });

    const postIds = saved.filter(s => s.entityType === 'post').map(s => s.entityId);

    let posts: Post[] = [];
    if (postIds.length > 0) {
      posts = await this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.id IN (:...postIds)', { postIds })
        .getMany();
    }

    return saved.map(s => {
      if (s.entityType === 'post') {
        const post = posts.find(p => p.id === s.entityId);
        return { ...s, entity: post };
      }
      return { ...s, entity: null };
    });
  }

  async save(userId: string, entityType: string, entityId: string) {
    const existing = await this.savedRepo.findOne({
      where: { user: { id: userId }, entityType: entityType as any, entityId },
    });
    if (existing) {
      throw new ConflictException('Already saved');
    }
    const saved = this.savedRepo.create({
      user: { id: userId } as any,
      entityType: entityType as any,
      entityId,
    });
    return this.savedRepo.save(saved);
  }

  async unsave(userId: string, itemId: string) {
    const saved = await this.savedRepo.findOne({
      where: { id: itemId, user: { id: userId } },
    });
    if (!saved) {
      throw new NotFoundException('Saved item not found');
    }
    await this.savedRepo.delete(itemId);
  }

  async isSaved(userId: string, entityType: string, entityId: string): Promise<boolean> {
    const count = await this.savedRepo.count({
      where: { user: { id: userId }, entityType: entityType as any, entityId },
    });
    return count > 0;
  }
}