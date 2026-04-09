import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { VideosService } from './services/videos.service';
import { VideosController } from './controllers/videos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  providers: [VideosService],
  controllers: [VideosController],
})
export class VideosModule {}