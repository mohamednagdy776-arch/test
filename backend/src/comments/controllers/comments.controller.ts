import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

import { CommentsService } from '../services/comments.service';
import { CreateCommentDto, UpdateCommentDto, ReactToCommentDto, PinCommentDto } from '../dto/create-comment.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';
import { sanitizeUserContent } from '../../common/utils/sanitize';

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
    // Sanitize user content against stored XSS (C-05)
    if (dto.content) dto.content = sanitizeUserContent(dto.content);
    if (!dto.content?.trim()) throw new (require('@nestjs/common').BadRequestException)('Comment cannot be empty after sanitization');
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
    // Sanitize on edit too — create() sanitized but update() didn't, letting a
    // benign comment be edited into a stored-XSS payload.
    if (dto.content) dto.content = sanitizeUserContent(dto.content);
    if (!dto.content?.trim()) throw new (require('@nestjs/common').BadRequestException)('Comment cannot be empty after sanitization');
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

@UseGuards(AuthGuard('jwt'))
@Controller('comments')
export class CommentRepliesController {
  constructor(private commentsService: CommentsService) {}

  @Get(':id/replies')
  async getReplies(
    @Param('id') id: string,
    @Query() query: PaginationDto,
  ) {
    const { data, total } = await this.commentsService.getReplies(id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async adminList(@Query() query: PaginationDto) {
    const { data, total } = await this.commentsService.findAll(query.page ?? 1, query.limit ?? 20);
    return paginated(data, total, query.page ?? 1, query.limit ?? 20);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('admin')
  async adminDelete(@Param('id') id: string) {
    await this.commentsService.adminDelete(id);
    return ok(null, 'Comment deleted');
  }
}