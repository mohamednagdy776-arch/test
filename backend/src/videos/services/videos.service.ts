import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Video } from '../entities/video.entity';
import { VideoLike } from '../entities/video-like.entity';
import { VideoComment } from '../entities/video-comment.entity';
import { CreateVideoDto } from '../dto/create-video.dto';
import { User } from '../../auth/entities/user.entity';
import { CdnService } from './cdn.service';
import { sanitizeUserContent } from '../../common/utils/sanitize';
import { Follow } from '../../follows/entities/follow.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video) private videosRepo: Repository<Video>,
    @InjectRepository(VideoLike) private likesRepo: Repository<VideoLike>,
    @InjectRepository(VideoComment) private commentsRepo: Repository<VideoComment>,
    @InjectRepository(Follow) private followsRepo: Repository<Follow>,
    private cdnService: CdnService,
  ) {}

  // #130 — POST /videos/:id/comments 404'd; there was no comments table/route
  // for videos at all (only posts had one).
  async addComment(videoId: string, content: string, user: User) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    const clean = sanitizeUserContent(content ?? '');
    if (!clean.trim()) throw new BadRequestException('Comment cannot be empty');

    const comment = this.commentsRepo.create({ video: { id: videoId } as any, user, content: clean });
    const saved = await this.commentsRepo.save(comment);
    return {
      id: saved.id,
      content: saved.content,
      createdAt: saved.createdAt,
      user: { id: user.id, username: user.username, name: user.fullName || user.username },
    };
  }

  // Video comments had create/read but no edit/delete at all -- unlike post
  // comments, which already support both (#303).
  async updateComment(commentId: string, content: string, userId: string) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId }, relations: ['user'] });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== userId) throw new ForbiddenException('Not authorized');
    const clean = sanitizeUserContent(content ?? '');
    if (!clean.trim()) throw new BadRequestException('Comment cannot be empty');
    comment.content = clean;
    const saved = await this.commentsRepo.save(comment);
    return { id: saved.id, content: saved.content, createdAt: saved.createdAt };
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentsRepo.findOne({ where: { id: commentId }, relations: ['user', 'video', 'video.createdBy'] });
    if (!comment) throw new NotFoundException('Comment not found');
    const isCommentAuthor = comment.user.id === userId;
    const isVideoOwner = comment.video?.createdBy?.id === userId;
    if (!isCommentAuthor && !isVideoOwner) throw new ForbiddenException('Not authorized');
    await this.commentsRepo.delete(commentId);
    return { success: true };
  }

  async getComments(videoId: string) {
    const comments = await this.commentsRepo.find({
      where: { video: { id: videoId } },
      order: { createdAt: 'ASC' },
      relations: ['user', 'user.profile'],
    });
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      // Missing avatarUrl -- commenters always fell back to their initial
      // letter regardless of a real uploaded avatar (#280).
      user: c.user ? { id: c.user.id, username: c.user.username, name: c.user.fullName || c.user.username, avatarUrl: (c.user as any).profile?.avatarUrl ?? null } : null,
    }));
  }

  // Normalize a video entity into the shape the web app reads. The raw entity
  // exposed `createdBy` + `views`, but the cards read `video.user.name` and
  // `video.viewCount`, so the uploader always showed "User" and views 0
  // (#76/#77). Emit both the uploader object and viewCount (keeping `views` too).
  private format(v: Video, likeCount = 0, isLiked = false) {
    const u: any = v.createdBy;
    const name =
      (u?.fullName && u.fullName.trim()) ||
      `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() ||
      u?.username ||
      'مستخدم';
    return {
      ...v,
      // Missing avatarUrl -- the video poster's avatar always fell back to
      // an initial letter regardless of a real uploaded avatar (#280).
      user: u ? { id: u.id, name, username: u.username ?? null, avatarUrl: u.profile?.avatarUrl ?? null } : null,
      // Cards read `thumbnailUrl` (a resolved CDN URL); the raw entity only
      // has the stored `thumbnail` key/path, so cards never showed a preview
      // (#74/#76).
      thumbnailUrl: v.thumbnail ? this.cdnService.getThumbnailUrl(v.thumbnail) : null,
      // Same gap for playback -- the reels/video players read `videoUrl`,
      // but only the raw `url` key/path was ever spread in, so no reel or
      // video ever actually played (#433).
      videoUrl: v.url ? this.cdnService.getVideoUrl(v.url) : null,
      viewCount: v.views ?? 0,
      viewsCount: v.views ?? 0,
      likeCount,
      likesCount: likeCount,
      isLiked,
    };
  }

  // Batch-load like counts (and the caller's liked state) for a list of videos
  // so cards can show accurate counts without an N+1 per video (#78).
  private async attachLikes(list: Video[], userId?: string) {
    if (list.length === 0) return [];
    const ids = list.map((v) => v.id);
    const countRows = await this.likesRepo
      .createQueryBuilder('l')
      .select('l.video_id', 'videoId')
      .addSelect('COUNT(*)', 'count')
      .where('l.video_id IN (:...ids)', { ids })
      .groupBy('l.video_id')
      .getRawMany<{ videoId: string; count: string }>();
    const counts = new Map(countRows.map((r) => [r.videoId, Number(r.count)]));

    let likedIds = new Set<string>();
    if (userId) {
      const liked = await this.likesRepo.find({
        where: { video: { id: In(ids) }, user: { id: userId } },
        relations: ['video'],
      });
      likedIds = new Set(liked.map((l) => l.video.id));
    }
    return list.map((v) => this.format(v, counts.get(v.id) ?? 0, likedIds.has(v.id)));
  }

  private async formatMany(list: Video[], userId?: string) {
    return this.attachLikes(list, userId);
  }

  async create(dto: CreateVideoDto, user: User) {
    const video = this.videosRepo.create({ ...dto, createdBy: user });
    return this.videosRepo.save(video);
  }

  async findAll(page: number, limit: number, isReel?: boolean) {
    const where = isReel !== undefined ? { isReel } : {};
    const [data, total] = await this.videosRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy', 'createdBy.profile'],
    });
    return { data: await this.formatMany(data), total };
  }

  // The "Following" tab called the generic list with no follow filter at all,
  // so it showed every video regardless of who (if anyone) the user follows
  // (#163).
  async findFollowing(userId: string, page: number, limit: number) {
    const follows = await this.followsRepo.find({ where: { followerId: userId } });
    const followedIds = follows.map((f) => f.followingId);
    if (followedIds.length === 0) return { data: [], total: 0 };

    const [data, total] = await this.videosRepo.findAndCount({
      where: { createdBy: { id: In(followedIds) }, isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy', 'createdBy.profile'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findTrending(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { views: 'DESC', createdAt: 'DESC' },
      relations: ['createdBy', 'createdBy.profile'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findRecommended(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy', 'createdBy.profile'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findContinueWatching(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy', 'createdBy.profile'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findReels(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy', 'createdBy.profile'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findOne(videoId: string, userId?: string) {
    const video = await this.videosRepo.findOne({
      where: { id: videoId },
      relations: ['createdBy', 'createdBy.profile'],
    });
    if (!video) throw new NotFoundException('Video not found');
    video.views += 1;
    await this.videosRepo.save(video);
    const likeCount = await this.likesRepo.count({ where: { video: { id: videoId } } });
    const isLiked = userId
      ? (await this.likesRepo.count({ where: { video: { id: videoId }, user: { id: userId } } })) > 0
      : false;
    return this.format(video, likeCount, isLiked);
  }

  async like(videoId: string, user: User) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    const existing = await this.likesRepo.findOne({
      where: { video: { id: videoId }, user: { id: user.id } },
    });
    if (existing) throw new ConflictException('Already liked');
    await this.likesRepo.save(this.likesRepo.create({
      video: { id: videoId } as any,
      user,
    }));
    const likeCount = await this.likesRepo.count({ where: { video: { id: videoId } } });
    return { id: videoId, isLiked: true, likeCount, likesCount: likeCount };
  }

  async unlike(videoId: string, userId: string) {
    const like = await this.likesRepo.findOne({
      where: { video: { id: videoId }, user: { id: userId } },
    });
    if (!like) throw new NotFoundException('Not liked');
    await this.likesRepo.delete(like.id);
    const likeCount = await this.likesRepo.count({ where: { video: { id: videoId } } });
    return { id: videoId, isLiked: false, likeCount, likesCount: likeCount };
  }

  // Multi-type reaction toggle, mirroring ReactionsService.react() for posts
  // -- the video player only ever supported a single boolean Like (#151).
  // Reuses the video_likes table (now with a `type` column) so isLiked/
  // likeCount elsewhere (video cards, etc) keep working unchanged: any row
  // still counts as "liked" regardless of which reaction type it holds.
  async react(videoId: string, type: string, user: User) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    const reactionType = type || 'like';

    const existing = await this.likesRepo.findOne({
      where: { video: { id: videoId }, user: { id: user.id } },
    });

    if (existing) {
      if (existing.type === reactionType) {
        await this.likesRepo.delete(existing.id);
        return { reacted: false, type: null, ...(await this.getReactionCounts(videoId)) };
      }
      existing.type = reactionType;
      await this.likesRepo.save(existing);
      return { reacted: true, type: reactionType, ...(await this.getReactionCounts(videoId)) };
    }

    await this.likesRepo.save(this.likesRepo.create({ video: { id: videoId } as any, user, type: reactionType }));
    return { reacted: true, type: reactionType, ...(await this.getReactionCounts(videoId)) };
  }

  async getReactions(videoId: string, viewerId?: string) {
    const reactions = await this.likesRepo.find({ where: { video: { id: videoId } }, relations: ['user'] });
    const counts: Record<string, number> = {};
    for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;
    const userReaction = viewerId ? reactions.find((r) => r.user?.id === viewerId)?.type ?? null : null;
    return { counts, total: reactions.length, userReaction };
  }

  private async getReactionCounts(videoId: string) {
    const { counts, total } = await this.getReactions(videoId);
    return { counts, likeCount: total, likesCount: total };
  }

  async delete(videoId: string, userId: string) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    if (video.createdBy.id !== userId) {
      throw new NotFoundException('Not authorized');
    }
    await this.videosRepo.delete(videoId);
  }
}