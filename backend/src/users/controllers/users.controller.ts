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

  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.usersService.getProfile(user.id);
    return ok(profile);
  }

  @Patch('me')
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    const profile = await this.usersService.updateProfile(user.id, dto);
    return ok(profile, 'Profile updated');
  }

  // Search users with filters
  @Get('search')
  async search(@Query() dto: SearchUsersDto) {
    const result = await this.usersService.searchUsers(dto);
    return ok(result);
  }

  // Get public profile of another user
  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.usersService.getPublicProfile(id);
    return ok(profile);
  }

  // Search users by profile fields
  @Get('search')
  async search(@Query() dto: SearchUsersDto, @CurrentUser() user: User) {
    const result = await this.usersService.search(dto, user.id);
    return ok(result);
  }

  // Get any user's public profile
  @Get(':id/profile')
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.usersService.getPublicProfile(id);
    return ok(profile);
  }

  // Admin: list all users
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.usersService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  // Admin: get user by id — must be AFTER /me to avoid conflict
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return ok(user);
  }

  // Admin: ban user
  @Patch(':id/ban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async ban(@Param('id') id: string) {
    const user = await this.usersService.ban(id);
    return ok(user, 'User banned');
  }

  // Admin: unban user
  @Patch(':id/unban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async unban(@Param('id') id: string) {
    const user = await this.usersService.unban(id);
    return ok(user, 'User unbanned');
  }
}
