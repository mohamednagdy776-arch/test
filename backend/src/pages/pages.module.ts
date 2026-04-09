import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { PageFollower } from './entities/page-follower.entity';
import { PageLike } from './entities/page-like.entity';
import { PagesService } from './services/pages.service';
import { PagesController } from './controllers/pages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Page, PageFollower, PageLike])],
  providers: [PagesService],
  controllers: [PagesController],
})
export class PagesModule {}