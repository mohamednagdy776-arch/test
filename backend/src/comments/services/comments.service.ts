import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { CommentReaction, CommentReactionType } from '../entities/comment-reaction.entity';
import { CreateCommentDto, UpdateCommentDto, ReactToCommentDto } from '../dto/create-comment.dto';
import { User } from '../../auth/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(CommentReaction) private reactionsRepo: Repository<CommentReaction>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private notifications: NotificationsService,
  ) {}

  async create(postId: string, dto: CreateCommentDto, user: User) {
    let depth = 0;

    if (dto.parentId) {
      const parent = await this.commentsRepo.findOne({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');

      // Validate the parent belongs to the same post
      const parentWithPost = await this.commentsRepo.findOne({
        where: { id: dto.parentId },
        relations: ['post'],
      });
      if (parentWithPost?.post?.id !== postId) {
        throw new BadRequestException('Parent comment does not belong to this post');
      }

      if (parent.depth >= 1) {
        throw new BadRequestException('Replies cannot exceed one level of nesting');
      }
      depth = parent.depth + 1;
    }

    const comment = this.commentsRepo.create({
      content: dto.content,
      post: { id: postId } as any,
      user,
      parent: dto.parentId ? ({ id: dto.parentId } as any) : null,
      depth,
    });
    const saved = await this.commentsRepo.save(comment);

    // Notify the post owner about the comment, and anyone @mentioned in it
    // (#383/#385). Best-effort — never blocks the comment from being created.
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    await this.notifications.notifyUser(post?.userId, user.id, 'comment', 'commented on your post', 'post', postId);
    await this.notifications.notifyMentions(dto.content, user.id, 'post', postId);

    return saved;
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
    // Load the user relation — without it comment.user is undefined and the
    // ownership check below throws a 500 instead of enforcing authorization.
    const comment = await this.commentsRepo.findOne({ where: { id: commentId }, relations: ['user'] });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== userId) throw new ForbiddenException('Not authorized');

    comment.content = dto.content;
    comment.editedAt = new Date();
    return this.commentsRepo.save(comment);
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId }, relations: ['user'] });
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

  async getReplies(commentId: string, page = 1, limit = 20) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    const [data, total] = await this.commentsRepo.findAndCount({
      where: { parentId: commentId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user', 'reactions'],
    });
    return { data, total };
  }
}