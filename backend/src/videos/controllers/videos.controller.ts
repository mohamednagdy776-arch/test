import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VideosService } from '../services/videos.service';
import { CreateVideoDto } from '../dto/create-video.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('videos')
export class VideosController {
  constructor(private videosService: VideosService) {}

  @Post()
  async create(@Body() dto: CreateVideoDto, @CurrentUser() user: User) {
    const video = await this.videosService.create(dto, user);
    return ok(video, 'Video created');
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.videosService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const video = await this.videosService.findOne(id);
    return ok(video);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.videosService.delete(id, user.id);
    return ok(null, 'Video deleted');
  }
}