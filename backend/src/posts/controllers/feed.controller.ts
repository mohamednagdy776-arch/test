import { Controller, Get, Query, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../services/posts.service';
import { paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('feed')
export class FeedController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getFeed(
    @Query('cursor') cursor: string | undefined = undefined,
    @Query('limit', new DefaultValuePipe(10)) limit: number = 10,
  ) {
    const { data, nextCursor, hasMore } = await this.postsService.getFeedByCursor(cursor, limit);
    return { data, pagination: { cursor: nextCursor, hasMore } };
  }

  @Get('recent')
  async getRecentFeed(
    @Query('cursor') cursor: string | undefined = undefined,
    @Query('limit', new DefaultValuePipe(10)) limit: number = 10,
  ) {
    const { data, nextCursor, hasMore } = await this.postsService.getRecentFeedByCursor(cursor, limit);
    return { data, pagination: { cursor: nextCursor, hasMore } };
  }
}
