import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { ReactionsService } from './services/reactions.service';
import { ReactionRealtimeService } from './services/reaction-realtime.service';
import { ReactionsController } from './controllers/reactions.controller';
import { Post } from '../posts/entities/post.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction, Post]), NotificationsModule],
  providers: [ReactionsService, ReactionRealtimeService],
  controllers: [ReactionsController],
  exports: [ReactionsService, ReactionRealtimeService],
})
export class ReactionsModule {}
