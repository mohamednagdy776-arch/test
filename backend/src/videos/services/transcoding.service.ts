import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoJob, VideoJobStatus } from '../entities/video-job.entity';

@Injectable()
export class TranscodingService {
  constructor(
    @InjectRepository(VideoJob) private videoJobsRepo: Repository<VideoJob>,
  ) {}

  async enqueueTranscoding(reelId: string, inputS3Key: string): Promise<VideoJob> {
    const job = this.videoJobsRepo.create({ reelId, inputS3Key, status: VideoJobStatus.QUEUED });
    return this.videoJobsRepo.save(job);
  }

  async getJobStatus(jobId: string): Promise<VideoJob | null> {
    return this.videoJobsRepo.findOne({ where: { id: jobId } });
  }

  async markProcessing(jobId: string): Promise<void> {
    await this.videoJobsRepo.update(jobId, {
      status: VideoJobStatus.PROCESSING,
      processingStartedAt: new Date(),
    });
  }

  async markCompleted(
    jobId: string,
    outputs: { key480p: string; key720p: string; thumbnailKey: string },
  ): Promise<void> {
    await this.videoJobsRepo.update(jobId, {
      status: VideoJobStatus.COMPLETED,
      outputS3Key480p: outputs.key480p,
      outputS3Key720p: outputs.key720p,
      thumbnailS3Key: outputs.thumbnailKey,
      completedAt: new Date(),
    });
  }

  async markFailed(jobId: string, errorMessage: string): Promise<void> {
    const job = await this.videoJobsRepo.findOne({ where: { id: jobId } });
    if (!job) return;
    if (job.retryCount < 3) {
      await this.videoJobsRepo.update(jobId, {
        retryCount: job.retryCount + 1,
        status: VideoJobStatus.QUEUED,
      });
    } else {
      await this.videoJobsRepo.update(jobId, {
        status: VideoJobStatus.FAILED,
        errorMessage,
      });
    }
  }
}
