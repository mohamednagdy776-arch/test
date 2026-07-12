import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SavedItem } from '../entities/saved-item.entity';
import { SavedCollection } from '../entities/saved-collection.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Video } from '../../videos/entities/video.entity';
import { Story } from '../../posts/entities/story.entity';
import { CdnService } from '../../videos/services/cdn.service';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedItem) private savedRepo: Repository<SavedItem>,
    @InjectRepository(SavedCollection) private collectionRepo: Repository<SavedCollection>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Video) private videoRepo: Repository<Video>,
    @InjectRepository(Story) private storyRepo: Repository<Story>,
    private cdnService: CdnService,
  ) {}

  // Hydrate each saved row with its underlying entity. Previously only
  // `entityType === 'post'` was ever populated — saved videos/stories always
  // got `entity: null`, which the "المحفوظات" list renders as a blank card
  // with only the remove icon (#80/#140/#156).
  private async hydrateEntities(saved: SavedItem[]) {
    const postIds = saved.filter(s => s.entityType === 'post').map(s => s.entityId);
    const videoIds = saved.filter(s => s.entityType === 'video').map(s => s.entityId);
    const storyIds = saved.filter(s => s.entityType === 'story').map(s => s.entityId);

    const [posts, videos, stories] = await Promise.all([
      postIds.length
        ? this.postRepo.createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .where('post.id IN (:...postIds)', { postIds })
            .getMany()
        : Promise.resolve([] as Post[]),
      videoIds.length
        ? this.videoRepo.find({ where: { id: In(videoIds) }, relations: ['createdBy'] })
        : Promise.resolve([] as Video[]),
      storyIds.length
        ? this.storyRepo.find({ where: { id: In(storyIds) }, relations: ['user'] })
        : Promise.resolve([] as Story[]),
    ]);

    return saved.map(s => {
      if (s.entityType === 'post') return { ...s, entity: posts.find(p => p.id === s.entityId) ?? null };
      if (s.entityType === 'video') {
        const video = videos.find(v => v.id === s.entityId);
        // The raw entity only has the stored `thumbnail` key, not a resolved
        // URL -- saved video cards rendered no thumbnail at all (#240).
        return {
          ...s,
          entity: video ? { ...video, thumbnailUrl: video.thumbnail ? this.cdnService.getThumbnailUrl(video.thumbnail) : null } : null,
        };
      }
      if (s.entityType === 'story') return { ...s, entity: stories.find(st => st.id === s.entityId) ?? null };
      return { ...s, entity: null };
    });
  }

  async getSaved(userId: string) {
    const saved = await this.savedRepo.find({
      where: { user: { id: userId } },
      relations: ['collection'],
      order: { savedAt: 'DESC' },
    });
    return this.hydrateEntities(saved);
  }

  async save(userId: string, entityType: string, entityId: string, collectionId?: string) {
    if (entityType === 'post') {
      const postExists = await this.postRepo.findOne({ where: { id: entityId } });
      if (!postExists) throw new NotFoundException('Post not found');
    }
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
    const collection = await this.collectionRepo.findOne({
      where: { id: collectionId, user: { id: userId } },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    const saved = await this.savedRepo.find({
      where: { user: { id: userId }, collection: { id: collectionId } },
      relations: ['collection'],
      order: { savedAt: 'DESC' },
    });
    return this.hydrateEntities(saved);
  }
}