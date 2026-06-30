import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';

@Injectable()
export class FeedService {
  constructor(@InjectRepository(Post) private postsRepo: Repository<Post>) {}

  async getFeed(
    userId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ posts: Post[]; nextCursor: string | null }> {
    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      // Expose real interaction counts so the "Trending Posts" widget shows the
      // number of likes/comments instead of a hard-coded 0 (#23).
      .loadRelationCountAndMap('post.likesCount', 'post.reactions')
      .loadRelationCountAndMap('post.commentsCount', 'post.comments', 'comment', (cq) =>
        cq.andWhere('comment.deleted_at IS NULL'),
      )
      // Engagement as a selected alias to ORDER BY. feed_score is never
      // recalculated (stays 0), so we rank by live engagement instead. A raw
      // subquery in orderBy with .take() made TypeORM misparse it as an alias and
      // 500 the feed; an addSelect alias + .limit() (the only join is many-to-one)
      // is safe.
      .addSelect(
        '(SELECT COUNT(*) FROM reactions r WHERE r.post_id = post.id) + (SELECT COUNT(*) FROM comments c WHERE c.post_id = post.id AND c.deleted_at IS NULL)',
        'engagement',
      )
      .where('post.deleted_at IS NULL')
      .andWhere('post.audience IN (:...audiences)', {
        audiences: ['public', 'friends', 'friends_of_friends'],
      })
      .orderBy('engagement', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .limit(limit + 1);

    if (cursor) {
      qb.andWhere('post.id < :cursor', { cursor });
    }

    const posts = await qb.getMany();
    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();

    return {
      posts,
      nextCursor: hasMore && posts.length > 0 ? posts[posts.length - 1].id : null,
    };
  }

  async recalculateFeedScore(postId: string): Promise<void> {
    // Score formula: (reactions*2 + comments*3) / (hours_since_posted + 2)^1.5
    await this.postsRepo.query(
      `UPDATE posts
       SET feed_score = (
         (COALESCE((SELECT COUNT(*) FROM reactions WHERE post_id = posts.id), 0) * 2 +
          COALESCE((SELECT COUNT(*) FROM comments WHERE post_id = posts.id AND deleted_at IS NULL), 0) * 3)
         / POWER(EXTRACT(EPOCH FROM (NOW() - posts.created_at))/3600 + 2, 1.5)
       )
       WHERE id = $1`,
      [postId],
    );
  }
}
