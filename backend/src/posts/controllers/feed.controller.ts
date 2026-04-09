import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../services/posts.service';
import { paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('feed')
export class FeedController {
  constructor(private postsService: PostsService) {}

  @Get()
  async getFeed(@Query() query: PaginationDto) {
    const { data, total } = await this.postsService.getFeed(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('recent')
  async getRecentFeed(@Query() query: PaginationDto) {
    const { data, total } = await this.postsService.getRecentFeed(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }
}
