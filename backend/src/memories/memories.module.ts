import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedItem } from './entities/saved-item.entity';
import { Post } from '../posts/entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { MemoryService } from './services/memory.service';
import { SavedService } from './services/saved.service';
import { MemoriesController } from './controllers/memories.controller';
import { SavedController } from './controllers/saved.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SavedItem, Post, Comment])],
  providers: [MemoryService, SavedService],
  controllers: [MemoriesController, SavedController],
})
export class MemoriesModule {}