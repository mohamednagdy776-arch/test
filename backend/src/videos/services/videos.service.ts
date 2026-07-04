import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Video } from '../entities/video.entity';
import { VideoLike } from '../entities/video-like.entity';
import { VideoComment } from '../entities/video-comment.entity';
import { CreateVideoDto } from '../dto/create-video.dto';
import { User } from '../../auth/entities/user.entity';
import { CdnService } from './cdn.service';
import { sanitizeUserContent } from '../../common/utils/sanitize';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video) private videosRepo: Repository<Video>,
    @InjectRepository(VideoLike) private likesRepo: Repository<VideoLike>,
    @InjectRepository(VideoComment) private commentsRepo: Repository<VideoComment>,
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

  async getComments(videoId: string) {
    const comments = await this.commentsRepo.find({
      where: { video: { id: videoId } },
      order: { createdAt: 'ASC' },
      relations: ['user'],
    });
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: c.user ? { id: c.user.id, username: c.user.username, name: c.user.fullName || c.user.username } : null,
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
      user: u ? { id: u.id, name, username: u.username ?? null } : null,
      // Cards read `thumbnailUrl` (a resolved CDN URL); the raw entity only
      // has the stored `thumbnail` key/path, so cards never showed a preview
      // (#74/#76).
      thumbnailUrl: v.thumbnail ? this.cdnService.getThumbnailUrl(v.thumbnail) : null,
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
      relations: ['createdBy'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findTrending(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { views: 'DESC', createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findRecommended(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findContinueWatching(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findReels(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: await this.formatMany(data), total };
  }

  async findOne(videoId: string, userId?: string) {
    const video = await this.videosRepo.findOne({
      where: { id: videoId },
      relations: ['createdBy'],
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

  async delete(videoId: string, userId: string) {
    const video = await this.videosRepo.findOne({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    if (video.createdBy.id !== userId) {
      throw new NotFoundException('Not authorized');
    }
    await this.videosRepo.delete(videoId);
  }
}