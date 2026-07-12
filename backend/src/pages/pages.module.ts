import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { PageFollower } from './entities/page-follower.entity';
import { PageLike } from './entities/page-like.entity';
import { Post } from '../posts/entities/post.entity';
import { PostsModule } from '../posts/posts.module';
import { PagesService } from './services/pages.service';
import { PagesController } from './controllers/pages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Page, PageFollower, PageLike, Post]), PostsModule],
  providers: [PagesService],
  controllers: [PagesController],
})
export class PagesModule {}