import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CommentReaction, CommentReactionType } from '../entities/comment-reaction.entity';
import { CreateCommentDto, UpdateCommentDto, ReactToCommentDto } from '../dto/create-comment.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(CommentReaction) private reactionsRepo: Repository<CommentReaction>,
  ) {}

  async create(postId: string, dto: CreateCommentDto, user: User) {
    const comment = this.commentsRepo.create({
      content: dto.content,
      post: { id: postId } as any,
      user,
      parent: dto.parentId ? ({ id: dto.parentId } as any) : null,
    });
    return this.commentsRepo.save(comment);
  }

  async findByPost(postId: string) {
    const comments = await this.commentsRepo.find({
      where: { post: { id: postId } },
      order: { isPinned: 'DESC', createdAt: 'ASC' },
      relations: ['user', 'parent', 'reactions'],
    });

    const nested = this.buildNestedComments(comments);
    return nested;
  }

  private buildNestedComments(comments: Comment[]): any[] {
    const map = new Map<string, any>();
    const roots: any[] = [];

    for (const c of comments) {
      map.set(c.id, { ...c, replies: [] });
    }

    for (const c of comments) {
      const node = map.get(c.id);
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async update(commentId: string, dto: UpdateCommentDto, userId: string) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== userId) throw new ForbiddenException('Not authorized');

    comment.content = dto.content;
    comment.editedAt = new Date();
    return this.commentsRepo.save(comment);
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== userId) throw new ForbiddenException('Not authorized');

    await this.commentsRepo.delete(commentId);
    return { success: true };
  }

  async react(commentId: string, dto: ReactToCommentDto, userId: string) {
    const existing = await this.reactionsRepo.findOne({
      where: { commentId, userId },
    });

    if (existing) {
      if (existing.type === dto.type) {
        await this.reactionsRepo.delete(existing.id);
        return { reacted: false, type: null };
      }
      existing.type = dto.type;
      return { reacted: true, type: (await this.reactionsRepo.save(existing)).type };
    }

    const reaction = this.reactionsRepo.create({ commentId, userId, type: dto.type });
    const saved = await this.reactionsRepo.save(reaction);
    return { reacted: true, type: saved.type };
  }

  async getReactions(commentId: string) {
    const reactions = await this.reactionsRepo.find({
      where: { commentId },
      relations: ['user'],
    });

    const counts: Record<string, number> = {};
    for (const r of reactions) {
      counts[r.type] = (counts[r.type] || 0) + 1;
    }

    return { reactions, counts, total: reactions.length };
  }

  async pin(postId: string, commentId: string, userId: string) {
    const post = await this.commentsRepo.manager.findOne('post', { where: { id: postId } });
    if (!post || (post as any).userId !== userId) throw new ForbiddenException('Not authorized');

    await this.reactionsRepo.query(
      `UPDATE comments SET is_pinned = false WHERE post_id = $1`,
      [postId],
    );

    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    comment.isPinned = true;
    return this.commentsRepo.save(comment);
  }

  async getUserReaction(commentId: string, userId: string) {
    return this.reactionsRepo.findOne({ where: { commentId, userId } });
  }
}