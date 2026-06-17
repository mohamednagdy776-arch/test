import { Controller, Get, Query, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../services/posts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('feed')
export class FeedController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getFeed(
    @CurrentUser() user: User,
    @Query('cursor') cursor: string | undefined = undefined,
    @Query('limit', new DefaultValuePipe(10)) limit: number = 10,
  ) {
    const { data, nextCursor, hasMore } = await this.postsService.getFeedByCursor(cursor, limit, user.id);
    return { data, pagination: { cursor: nextCursor, hasMore } };
  }

  @Get('recent')
  async getRecentFeed(
    @CurrentUser() user: User,
    @Query('cursor') cursor: string | undefined = undefined,
    @Query('limit', new DefaultValuePipe(10)) limit: number = 10,
  ) {
    const { data, nextCursor, hasMore } = await this.postsService.getRecentFeedByCursor(cursor, limit, user.id);
    return { data, pagination: { cursor: nextCursor, hasMore } };
  }
}
