import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
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
}
