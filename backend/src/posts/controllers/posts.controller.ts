import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('groups/:groupId/posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  async create(
    @Param('groupId') groupId: string,
    @Body() dto: CreatePostDto,
    @CurrentUser() user: User,
  ) {
    const post = await this.postsService.create(groupId, dto, user);
    return ok(post, 'Post created');
  }

  @Get()
  async findAll(@Param('groupId') groupId: string, @Query() query: PaginationDto) {
    const { data, total } = await this.postsService.findByGroup(groupId, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Delete(':postId')
  async delete(@Param('postId') postId: string) {
    await this.postsService.delete(postId);
    return ok(null, 'Post deleted');
  }
}
