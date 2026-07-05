import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards, HttpException, HttpStatus, ParseBoolPipe, Optional } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VideosService } from '../services/videos.service';
import { CdnService } from '../services/cdn.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { VideoQueryDto } from '../dto/video-query.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('videos')
export class VideosController {
  constructor(
    private videosService: VideosService,
    private cdnService: CdnService,
  ) {}

  @Post()
  async create(@Body() dto: CreateVideoDto, @CurrentUser() user: User) {
    const video = await this.videosService.create(dto, user);
    return ok(video, 'Video created');
  }

  @Get()
  async findAll(@Query() query: VideoQueryDto) {
    const isReel = query.isReel === 'true' ? true : query.isReel === 'false' ? false : undefined;
    const { data, total } = await this.videosService.findAll(query.page!, query.limit!, isReel);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('trending')
  async trending(@Query() query: PaginationDto) {
    const { data, total } = await this.videosService.findTrending(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('recommended')
  async recommended(@Query() query: PaginationDto) {
    const { data, total } = await this.videosService.findRecommended(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('following')
  async following(@Query() query: PaginationDto, @CurrentUser() user: User) {
    const { data, total } = await this.videosService.findFollowing(user.id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('continue-watching')
  async continueWatching(@Query() query: PaginationDto) {
    const { data, total } = await this.videosService.findContinueWatching(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
    }
    const video = await this.videosService.findOne(id, user?.id);
    return ok(video);
  }

  @Post(':id/like')
  async like(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.videosService.like(id, user);
    return ok(result, 'Video liked');
  }

  @Delete(':id/like')
  async unlike(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.videosService.unlike(id, user.id);
    return ok(result, 'Video unliked');
  }

  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    return ok(await this.videosService.getComments(id));
  }

  @Post(':id/comments')
  async addComment(@Param('id') id: string, @Body() body: { content: string }, @CurrentUser() user: User) {
    const comment = await this.videosService.addComment(id, body.content, user);
    return ok(comment, 'Comment added');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.videosService.delete(id, user.id);
    return ok(null, 'Video deleted');
  }
}

@UseGuards(AuthGuard('jwt'))
@Controller('reels')
export class ReelsController {
  constructor(
    private videosService: VideosService,
    private cdnService: CdnService,
  ) {}

  @Get()
  async findReels(@Query() query: PaginationDto) {
    const { data, total } = await this.videosService.findReels(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get(':id/stream')
  async stream(@Param('id') id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new HttpException('Reel not found', HttpStatus.NOT_FOUND);
    }
    const video = await this.videosService.findOne(id);
    const streamUrl = this.cdnService.getVideoUrl(video.url);
    const thumbnailUrl = this.cdnService.getThumbnailUrl(video.thumbnail);
    return ok({ id: video.id, streamUrl, thumbnailUrl });
  }
}