import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from '../entities/reaction.entity';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { User } from '../../auth/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Reaction) private reactionsRepo: Repository<Reaction>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private notifications: NotificationsService,
  ) {}

  async react(postId: string, dto: CreateReactionDto, user: User) {
    const existing = await this.reactionsRepo.findOne({
      where: { post: { id: postId }, user: { id: user.id } },
    });

    if (existing) {
      // Toggle off if same type, update if different type
      if (existing.type === (dto.type || 'like')) {
        await this.reactionsRepo.delete(existing.id);
        const post = await this.postsRepo.findOne({ where: { id: postId } });
        if (post) await this.notifications.deleteByEntity(post.userId, user.id, 'like', postId);
        return { reacted: false, type: null };
      }
      existing.type = dto.type || 'like';
      const saved = await this.reactionsRepo.save(existing);
      return { reacted: true, type: saved.type };
    }

    const reaction = this.reactionsRepo.create({
      post: { id: postId } as any,
      user,
      type: dto.type || 'like',
    });
    const saved = await this.reactionsRepo.save(reaction);

    // Notify the post owner that someone reacted to their post (#382).
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    await this.notifications.notifyUser(post?.userId, user.id, 'like', 'reacted to your post', 'post', postId);

    return { reacted: true, type: saved.type };
  }

  async findByPost(postId: string) {
    const reactions = await this.reactionsRepo.find({
      where: { post: { id: postId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    // Group by type
    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.type] = (counts[r.type] || 0) + 1;
    }

    return { reactions, counts, total: reactions.length };
  }

  async getUserReaction(postId: string, userId: string) {
    return this.reactionsRepo.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });
  }

  async getPostReactionCounts(postId: string) {
    const reactions = await this.reactionsRepo.find({
      where: { post: { id: postId } },
    });
    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.type] = (counts[r.type] || 0) + 1;
    }
    return { counts, total: reactions.length };
  }
}
