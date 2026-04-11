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

  async create(dto: CreateVideoDto, user: User) {
    const video = this.videosRepo.create({ ...dto, createdBy: user });
    return this.videosRepo.save(video);
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data, total };
  }

  async findTrending(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { views: 'DESC', createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data, total };
  }

  async findRecommended(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data, total };
  }

  async findContinueWatching(page: number, limit: number) {
    const [data, total] = await this.videosRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['createdBy'],
    });
    return { data, total };
  }

  async findOne(videoId: string) {
    const video = await this.videosRepo.findOne({
      where: { id: videoId },
      relations: ['createdBy'],
    });
    if (!video) throw new NotFoundException('Video not found');
    video.views += 1;
    await this.videosRepo.save(video);
    return video;
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