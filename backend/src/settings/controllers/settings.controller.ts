import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SettingsService } from '../services/settings.service';
import { UpdatePrivacyDto } from '../dto/update-privacy.dto';
import { UpdateAppearanceDto } from '../dto/update-appearance.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notifications.dto';
import { UpdateNewsletterDto } from '../dto/update-newsletter.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // ==================== Privacy Settings ====================
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

  // ==================== Appearance Settings ====================
  @Get('settings/appearance')
  async getAppearance(@CurrentUser() user: User) {
    const settings = await this.settingsService.getAppearanceSettings(user.id);
    return ok(settings);
  }

  @Patch('settings/appearance')
  async updateAppearance(@CurrentUser() user: User, @Body() dto: UpdateAppearanceDto) {
    const settings = await this.settingsService.updateAppearanceSettings(user.id, dto);
    return ok(settings, 'Appearance settings updated');
  }

  // ==================== Notification Settings ====================
  @Get('settings/notifications')
  async getNotifications(@CurrentUser() user: User) {
    const settings = await this.settingsService.getNotificationSettings(user.id);
    return ok(settings);
  }

  @Patch('settings/notifications')
  async updateNotifications(@CurrentUser() user: User, @Body() dto: UpdateNotificationSettingsDto) {
    const settings = await this.settingsService.updateNotificationSettings(user.id, dto);
    return ok(settings, 'Notification settings updated');
  }

  // ==================== Newsletter Settings ====================
  @Get('settings/newsletter')
  async getNewsletter(@CurrentUser() user: User) {
    const settings = await this.settingsService.getNewsletterSettings(user.id);
    return ok(settings);
  }

  @Patch('settings/newsletter')
  async updateNewsletter(@CurrentUser() user: User, @Body() dto: UpdateNewsletterDto) {
    const settings = await this.settingsService.updateNewsletterSettings(user.id, dto);
    return ok(settings, 'Newsletter settings updated');
  }

  // ==================== Block Management ====================
  @Get('blocks')
  async getBlocks(@CurrentUser() user: User) {
    const blocks = await this.settingsService.getBlockedUsers(user.id);
    return ok(blocks);
  }

  @Post('blocks')
  async blockUser(@CurrentUser() user: User, @Body() dto: { blockedUserId: string }) {
    const block = await this.settingsService.blockUser(user.id, dto.blockedUserId);
    return ok(block, 'User blocked');
  }

  @Delete('blocks/:id')
  async unblockUser(@CurrentUser() user: User, @Param('id') blockedUserId: string) {
    await this.settingsService.unblockUser(user.id, blockedUserId);
    return ok(null, 'User unblocked');
  }

  // ==================== Support Reports ====================
  @Post('support/report')
  @UseInterceptors(FilesInterceptor('attachments', 3))
  async submitSupportReport(
    @CurrentUser() user: User,
    @Body() body: { type?: string; description?: string; email?: string },
    @UploadedFiles() attachments?: Express.Multer.File[],
  ) {
    // Log report server-side; in production this would persist to a table or forward to a helpdesk.
    console.log(`[support/report] user=${user.id} type=${body.type} files=${attachments?.length ?? 0}`);
    return ok({ received: true }, 'تم استلام بلاغك، شكراً لك');
  }
}