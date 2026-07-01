import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../entities/video.entity';
import { CreateVideoDto } from '../dto/create-video.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video) private videosRepo: Repository<Video>,
  ) {}

  // Normalize a video entity into the shape the web app reads. The raw entity
  // exposed `createdBy` + `views`, but the cards read `video.user.name` and
  // `video.viewCount`, so the uploader always showed "User" and views 0
  // (#76/#77). Emit both the uploader object and viewCount (keeping `views` too).
  private format(v: Video) {
    const u: any = v.createdBy;
    const name =
      (u?.fullName && u.fullName.trim()) ||
      `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim() ||
      u?.username ||
      'مستخدم';
    return {
      ...v,
      user: u ? { id: u.id, name, username: u.username ?? null } : null,
      viewCount: v.views ?? 0,
      viewsCount: v.views ?? 0,
    };
  }

  private formatMany(list: Video[]) {
    return list.map((v) => this.format(v));
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
    return { data: this.formatMany(data), total };
  }

  async findTrending(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { views: 'DESC', createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: this.formatMany(data), total };
  }

  async findRecommended(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: this.formatMany(data), total };
  }

  async findContinueWatching(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: this.formatMany(data), total };
  }

  async findReels(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      where: { isReel: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data: this.formatMany(data), total };
  }

  async findOne(videoId: string) {
    const video = await this.videosRepo.findOne({
      where: { id: videoId },
      relations: ['createdBy'],
    });
    if (!video) throw new NotFoundException('Video not found');
    video.views += 1;
    await this.videosRepo.save(video);
    return this.format(video);
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