import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from '../services/settings.service';
import { UpdatePrivacyDto, BlockUserDto } from '../dto/update-privacy.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('settings/privacy')
  async getPrivacy(@CurrentUser() user: User) {
    const settings = await this.settingsService.getPrivacySettings(user.id);
    return ok(settings);
  }

  @Patch('settings/privacy')
  async updatePrivacy(@CurrentUser() user: User, @Body() dto: UpdatePrivacyDto) {
    const settings = await this.settingsService.updatePrivacySettings(user.id, dto);
    return ok(settings, 'Privacy settings updated');
  }

  @Get('blocks')
  async getBlocks(@CurrentUser() user: User) {
    const blocks = await this.settingsService.getBlockedUsers(user.id);
    return ok(blocks.map(b => b.blocked));
  }

  @Post('blocks')
  async blockUser(@CurrentUser() user: User, @Body() dto: BlockUserDto) {
    const block = await this.settingsService.blockUser(user.id, dto.blockedUserId);
    return ok(block, 'User blocked');
  }

  @Delete('blocks/:id')
  async unblockUser(@CurrentUser() user: User, @Param('id') blockedUserId: string) {
    await this.settingsService.unblockUser(user.id, blockedUserId);
    return ok(null, 'User unblocked');
  }
}