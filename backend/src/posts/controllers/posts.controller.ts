import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get(':postId')
  async getPost(@Param('postId') postId: string) {
    const post = await this.postsService.findById(postId);
    return ok(post);
  }

  @Patch(':postId')
  async updatePost(@Param('postId') postId: string, @Body() dto: CreatePostDto, @CurrentUser() user: User) {
    const post = await this.postsService.update(postId, dto, user.id);
    return ok(post, 'Post updated');
  }

  @Delete(':postId')
  async deletePost(@Param('postId') postId: string, @CurrentUser() user: User) {
    await this.postsService.softDelete(postId, user.id);
    return ok(null, 'Post deleted');
  }

  @Post(':postId/pin')
  async pinPost(@Param('postId') postId: string, @CurrentUser() user: User) {
    const post = await this.postsService.togglePin(postId, user.id);
    return ok(post, post.isPinned ? 'Post pinned' : 'Post unpinned');
  }

  @Post(':postId/archive')
  async archivePost(@Param('postId') postId: string, @CurrentUser() user: User) {
    const post = await this.postsService.archive(postId, user.id);
    return ok(post, 'Post archived');
  }

  @Post(':postId/save')
  async savePost(@Param('postId') postId: string, @CurrentUser() user: User) {
    const saved = await this.postsService.saveForLater(postId, user.id);
    return ok(saved, 'Post saved');
  }

  @Post(':postId/share')
  async sharePost(@Param('postId') postId: string, @Body('content') content: string, @CurrentUser() user: User) {
    const shared = await this.postsService.share(postId, content, user.id);
    return ok(shared, 'Post shared');
  }

  @Get('saved')
  async getSavedPosts(@CurrentUser() user: User, @Query() query: PaginationDto) {
    const { data, total } = await this.postsService.getSavedPosts(user.id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('scheduled')
  async getScheduledPosts(@CurrentUser() user: User, @Query() query: PaginationDto) {
    const { data, total } = await this.postsService.getScheduledPosts(user.id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Post(':postId/comments-disabled')
  async toggleComments(@Param('postId') postId: string, @Body('disabled') disabled: boolean, @CurrentUser() user: User) {
    const post = await this.postsService.toggleComments(postId, user.id, disabled);
    return ok(post, disabled ? 'Comments disabled' : 'Comments enabled');
  }
}