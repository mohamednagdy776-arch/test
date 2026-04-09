import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { CommentsService } from '../services/comments.service';
import { CreateCommentDto, UpdateCommentDto, ReactToCommentDto, PinCommentDto } from '../dto/create-comment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  async create(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.create(postId, dto, user);
    return ok(comment, 'Comment added');
  }

  @Get()
  async findAll(@Param('postId') postId: string) {
    const comments = await this.commentsService.findByPost(postId);
    return ok(comments);
  }

  @Patch(':commentId')
  async update(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.update(commentId, dto, user.id);
    return ok(comment, 'Comment updated');
  }

  @Delete(':commentId')
  async delete(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.commentsService.delete(commentId, user.id);
    return ok(result, 'Comment deleted');
  }

  @Post(':commentId/reactions')
  async react(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: ReactToCommentDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.commentsService.react(commentId, dto, user.id);
    return ok(result, result.reacted ? 'Reaction added' : 'Reaction removed');
  }

  @Get(':commentId/reactions')
  async getReactions(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    const result = await this.commentsService.getReactions(commentId);
    return ok(result);
  }

  @Get(':commentId/reactions/me')
  async getMyReaction(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: User,
  ) {
    const reaction = await this.commentsService.getUserReaction(commentId, user.id);
    return ok(reaction);
  }

  @Post(':commentId/pin')
  async pin(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: PinCommentDto,
    @CurrentUser() user: User,
  ) {
    const comment = await this.commentsService.pin(postId, commentId, user.id);
    return ok(comment, dto.isPinned ? 'Comment pinned' : 'Comment unpinned');
  }
}