import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from '../services/posts.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';

// Admin-level flat posts endpoint (not nested under a group)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('posts')
export class AdminPostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.postsService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.postsService.delete(id);
    return ok(null, 'Post deleted');
  }
}
