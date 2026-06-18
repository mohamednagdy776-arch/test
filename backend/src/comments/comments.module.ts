import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentReaction } from './entities/comment-reaction.entity';
import { CommentsService } from './services/comments.service';
import { CommentsController, CommentRepliesController } from './controllers/comments.controller';
import { Post } from '../posts/entities/post.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, CommentReaction, Post]), NotificationsModule],
  providers: [CommentsService],
  controllers: [CommentsController, CommentRepliesController],
  exports: [CommentsService],
})
export class CommentsModule {}