import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { SearchUsersDto } from '../dto/search-users.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ── Current user ──────────────────────────────────────────────

  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    return ok(await this.usersService.getProfile(user.id));
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return ok(await this.usersService.updateProfile(user.id, dto), 'Profile updated');
  }

  // ── Search (must be before :id routes) ───────────────────────

  @Get('search')
  async search(@Query() dto: SearchUsersDto) {
    return ok(await this.usersService.searchUsers(dto));
  }

  // ── Public profile ────────────────────────────────────────────

  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    return ok(await this.usersService.getPublicProfile(id));
  }

  // ── Admin ─────────────────────────────────────────────────────

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.usersService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return ok(await this.usersService.findOne(id));
  }

  @Patch(':id/ban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async ban(@Param('id') id: string) {
    return ok(await this.usersService.ban(id), 'User banned');
  }

  @Patch(':id/unban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async unban(@Param('id') id: string) {
    return ok(await this.usersService.unban(id), 'User unbanned');
  }
}
