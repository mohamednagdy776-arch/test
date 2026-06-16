import { Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FollowsService } from '../services/follows.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { ok } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Post(':id/follow')
  async follow(@CurrentUser() user: User, @Param('id') id: string) {
    return ok(await this.followsService.follow(user.id, id), 'Following');
  }

  @Delete(':id/follow')
  async unfollow(@CurrentUser() user: User, @Param('id') id: string) {
    return ok(await this.followsService.unfollow(user.id, id), 'Unfollowed');
  }

  @Get(':id/follow-status')
  async followStatus(@CurrentUser() user: User, @Param('id') id: string) {
    return ok(await this.followsService.isFollowing(user.id, id));
  }

  @Get(':id/followers')
  async followers(@Param('id') id: string, @Query() q: PaginationDto, @Query('search') search?: string) {
    return ok(await this.followsService.getFollowers(id, q.page, q.limit, search));
  }

  @Get(':id/following')
  async following(@Param('id') id: string, @Query() q: PaginationDto, @Query('search') search?: string) {
    return ok(await this.followsService.getFollowing(id, q.page, q.limit, search));
  }

  @Get(':id/follow-counts')
  async counts(@Param('id') id: string) {
    return ok(await this.followsService.getCounts(id));
  }
}
