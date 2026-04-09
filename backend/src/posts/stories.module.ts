import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story, StoryView, StoryHighlight, SavedPost, PostReport, HiddenPost } from './entities/story.entity';
import { StoriesService } from './services/stories.service';
import { StoriesController } from './controllers/stories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Story, StoryView, StoryHighlight, SavedPost, PostReport, HiddenPost])],
  providers: [StoriesService],
  controllers: [StoriesController],
  exports: [StoriesService],
})
export class StoriesModule {}