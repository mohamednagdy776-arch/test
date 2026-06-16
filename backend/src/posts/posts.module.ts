import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Story, StoryView, StoryHighlight, SavedPost, PostReport, HiddenPost } from './entities/story.entity';
import { PostsService } from './services/posts.service';
import { StoriesService } from './services/stories.service';
import { PostsController } from './controllers/posts.controller';
import { AdminPostsController } from './controllers/admin-posts.controller';
import { FeedController } from './controllers/feed.controller';
import { StoriesController } from './controllers/stories.controller';
import { UploadController } from './controllers/upload.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Story, StoryView, StoryHighlight, SavedPost, PostReport, HiddenPost]), NotificationsModule, SettingsModule],
  providers: [PostsService, StoriesService],
  controllers: [PostsController, AdminPostsController, FeedController, StoriesController, UploadController],
  exports: [PostsService],
})
export class PostsModule {}