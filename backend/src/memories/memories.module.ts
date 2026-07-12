import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedItem } from './entities/saved-item.entity';
import { SavedCollection } from './entities/saved-collection.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Video } from '../videos/entities/video.entity';
import { Story } from '../posts/entities/story.entity';
import { MemoryService } from './services/memory.service';
import { SavedService } from './services/saved.service';
import { MemoriesController } from './controllers/memories.controller';
import { SavedController } from './controllers/saved.controller';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [TypeOrmModule.forFeature([SavedItem, SavedCollection, Post, Comment, Video, Story]), VideosModule],
  providers: [MemoryService, SavedService],
  controllers: [MemoriesController, SavedController],
})
export class MemoriesModule {}