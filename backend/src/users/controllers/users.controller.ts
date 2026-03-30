import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../services/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
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
}
