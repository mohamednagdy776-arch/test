import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Story, StoryView, StoryHighlight, StoryReaction, SavedPost, PostReport, HiddenPost } from './entities/story.entity';
import { Follow } from '../follows/entities/follow.entity';
import { PostsService } from './services/posts.service';
import { FeedService } from './services/feed.service';
import { StoriesService } from './services/stories.service';
import { PostsController } from './controllers/posts.controller';
import { AdminPostsController } from './controllers/admin-posts.controller';
import { FeedController } from './controllers/feed.controller';
import { StoriesController } from './controllers/stories.controller';
import { UploadController } from './controllers/upload.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { LinkPreviewModule } from '../link-preview/link-preview.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Story, StoryView, StoryHighlight, StoryReaction, SavedPost, PostReport, HiddenPost, Follow]), NotificationsModule, SettingsModule, LinkPreviewModule],
  providers: [PostsService, FeedService, StoriesService],
  controllers: [PostsController, AdminPostsController, FeedController, StoriesController, UploadController],
  exports: [PostsService, StoriesService],
})
export class PostsModule {}