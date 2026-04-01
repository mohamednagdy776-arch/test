import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(private groupsService: GroupsService) {}

  @Post()
  async create(@Body() dto: CreateGroupDto, @CurrentUser() user: User) {
    const group = await this.groupsService.create(dto, user);
    return ok(group, 'Group created');
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.groupsService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('search')
  async search(@Query('q') q: string, @CurrentUser() user: User) {
    const result = await this.groupsService.search(q, user.id);
    return ok(result);
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string) {
    const results = await this.groupsService.autocomplete(q);
    return ok(results);
  }

  @Get('my')
  async myGroups(@CurrentUser() user: User) {
    const groups = await this.groupsService.getMyGroups(user.id);
    return ok(groups);
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @CurrentUser() user: User) {
    const group = await this.groupsService.join(id, user);
    return ok(group, 'Joined group');
  }

  @Delete(':id/leave')
  async leave(@Param('id') id: string, @CurrentUser() user: User) {
    await this.groupsService.leave(id, user.id);
    return ok(null, 'Left group');
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    await this.groupsService.delete(id);
    return ok(null, 'Group deleted');
  }
}
