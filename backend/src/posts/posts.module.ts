import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostsService } from './services/posts.service';
import { PostsController } from './controllers/posts.controller';
import { AdminPostsController } from './controllers/admin-posts.controller';
import { FeedController } from './controllers/feed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  providers: [PostsService],
  controllers: [PostsController, AdminPostsController, FeedController],
})
export class PostsModule {}
