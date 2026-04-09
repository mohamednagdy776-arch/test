import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchService } from './services/search.service';
import { SearchController } from './controllers/search.controller';
import { User } from '../auth/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Group } from '../groups/entities/group.entity';
import { Page } from '../pages/entities/page.entity';
import { Event } from '../events/entities/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Group, Page, Event])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}