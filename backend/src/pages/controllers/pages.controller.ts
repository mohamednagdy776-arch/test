import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PagesService } from '../services/pages.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('pages')
export class PagesController {
  constructor(private pagesService: PagesService) {}

  @Post()
  async create(@Body() dto: CreatePageDto, @CurrentUser() user: User) {
    const page = await this.pagesService.create(dto, user);
    return ok(page, 'Page created');
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.pagesService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('my')
  async myPages(@CurrentUser() user: User) {
    const pages = await this.pagesService.getMyPages(user.id);
    return ok(pages);
  }

  // Static segments MUST precede @Get(':id') or they get captured by :id and
  // rejected as a non-UUID ("Invalid identifier format").
  @Get('created')
  async created(@CurrentUser() user: User) {
    return ok(await this.pagesService.getCreated(user.id));
  }

  @Get('suggested')
  async suggested(@Query('limit') limit: string, @CurrentUser() user: User) {
    return ok(await this.pagesService.getSuggested(user.id, limit ? Number(limit) : 5));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user?: User) {
    const page = await this.pagesService.findOne(id, user?.id);
    return ok(page);
  }

  @Get(':id/posts')
  async pagePosts(@Param('id') id: string, @Query() query: PaginationDto) {
    const { data, total } = await this.pagesService.getPosts(id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Post(':id/follow')
  async follow(@Param('id') id: string, @CurrentUser() user: User) {
    const page = await this.pagesService.follow(id, user);
    return ok(page, 'Following page');
  }

  @Delete(':id/follow')
  async unfollow(@Param('id') id: string, @CurrentUser() user: User) {
    await this.pagesService.unfollow(id, user.id);
    return ok(null, 'Unfollowed page');
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: User) {
    const page = await this.pagesService.like(id, user);
    return ok(page, 'Liked page');
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @CurrentUser() user: User) {
    await this.pagesService.unlike(id, user.id);
    return ok(null, 'Unliked page');
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string, @CurrentUser() user?: User) {
    const page = await this.pagesService.findByUsername(username, user?.id);
    return ok(page);
  }
}