import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
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
}
