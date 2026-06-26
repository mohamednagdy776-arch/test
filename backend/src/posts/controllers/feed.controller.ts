import { BadRequestException, Controller, Get, Query, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../services/posts.service';
import { FeedService } from '../services/feed.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('feed')
export class FeedController {
  constructor(
    private postsService: PostsService,
    private feedService: FeedService,
  ) {}

  @Get()
  async getFeed(
    @CurrentUser() user: User,
    @Query('cursor') cursor: string | undefined = undefined,
    @Query('limit', new DefaultValuePipe(10)) limit: number = 10,
  ) {
    const numLimit = Number(limit);
    if (numLimit < 1) throw new BadRequestException('limit must be a positive integer');
    const safeLimit = Math.min(100, numLimit || 10);
    const { data, nextCursor, hasMore } = await this.postsService.getFeedByCursor(cursor, safeLimit, user.id);
    return { data, pagination: { cursor: nextCursor, hasMore } };
  }

  @Get('recent')
  async getRecentFeed(
    @CurrentUser() user: User,
    @Query('cursor') cursor: string | undefined = undefined,
    @Query('limit', new DefaultValuePipe(10)) limit: number = 10,
  ) {
    const numLimit = Number(limit);
    if (numLimit < 1) throw new BadRequestException('limit must be a positive integer');
    const safeLimit = Math.min(100, numLimit || 10);
    const { data, nextCursor, hasMore } = await this.postsService.getRecentFeedByCursor(cursor, safeLimit, user.id);
    return { data, pagination: { cursor: nextCursor, hasMore } };
  }

  @Get('scored')
  async getScoredFeed(
    @CurrentUser() user: User,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const { posts, nextCursor } = await this.feedService.getFeed(
      user.id,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
    return { data: posts, pagination: { cursor: nextCursor, hasMore: nextCursor !== null } };
  }
}
