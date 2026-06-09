import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedItem } from '../entities/saved-item.entity';
import { SavedCollection } from '../entities/saved-collection.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedItem) private savedRepo: Repository<SavedItem>,
    @InjectRepository(SavedCollection) private collectionRepo: Repository<SavedCollection>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async getSaved(userId: string) {
    const saved = await this.savedRepo.find({
      where: { user: { id: userId } },
      relations: ['collection'],
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

  async save(userId: string, entityType: string, entityId: string, collectionId?: string) {
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
      collectionId,
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

  // Collections
  async getCollections(userId: string) {
    return this.collectionRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async createCollection(userId: string, name: string, coverImage?: string) {
    const collection = this.collectionRepo.create({
      user: { id: userId } as any,
      name,
      coverImage,
    });
    return this.collectionRepo.save(collection);
  }

  async updateCollection(userId: string, collectionId: string, name?: string, coverImage?: string) {
    const collection = await this.collectionRepo.findOne({
      where: { id: collectionId, user: { id: userId } },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    if (name) collection.name = name;
    if (coverImage) collection.coverImage = coverImage;
    return this.collectionRepo.save(collection);
  }

  async deleteCollection(userId: string, collectionId: string) {
    const collection = await this.collectionRepo.findOne({
      where: { id: collectionId, user: { id: userId } },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    // Remove collection from saved items
    await this.savedRepo.update({ collectionId }, { collectionId: null as any });
    await this.collectionRepo.delete(collectionId);
  }

  async getCollectionItems(userId: string, collectionId: string) {
    const saved = await this.savedRepo.find({
      where: { user: { id: userId }, collection: { id: collectionId } },
      relations: ['collection'],
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
}