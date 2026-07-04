import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { VideoLike } from './entities/video-like.entity';
import { VideoJob } from './entities/video-job.entity';
import { VideoModerationLog } from './entities/moderation-log.entity';
import { VideoComment } from './entities/video-comment.entity';
import { VideosService } from './services/videos.service';
import { TranscodingService } from './services/transcoding.service';
import { CdnService } from './services/cdn.service';
import { VideosController, ReelsController } from './controllers/videos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Video, VideoLike, VideoJob, VideoModerationLog, VideoComment])],
  providers: [VideosService, TranscodingService, CdnService],
  controllers: [VideosController, ReelsController],
  exports: [VideosService, TranscodingService, CdnService],
})
export class VideosModule {}
