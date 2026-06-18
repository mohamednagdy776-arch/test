import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../services/notifications.service';
import { NotificationDispatchService } from '../services/notification-dispatch.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { RegisterDeviceTokenDto } from '../dto/register-device-token.dto';
import { UpdateNotificationPreferencesDto } from '../dto/update-notification-preferences.dto';
import { DeviceToken } from '../entities/device-token.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private notificationDispatchService: NotificationDispatchService,
    @InjectRepository(DeviceToken) private deviceTokensRepo: Repository<DeviceToken>,
    @InjectRepository(NotificationPreference) private prefsRepo: Repository<NotificationPreference>,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: User, @Query() query: PaginationDto) {
    const { data, total } = await this.notificationsService.findByUser(user.id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationsService.findUnreadCount(user.id);
    return ok({ count });
  }

  @Post()
  async create(@Body() dto: CreateNotificationDto, @CurrentUser() user: User) {
    const notification = await this.notificationsService.create(user.id, dto);
    return ok(notification, 'Notification created');
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    const notification = await this.notificationsService.markAsRead(id, user.id);
    return ok(notification, 'Notification marked as read');
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user.id);
    return ok(null, 'All notifications marked as read');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.notificationsService.delete(id, user.id);
    return ok(null, 'Notification deleted');
  }

  @Post('device-token')
  async registerDeviceToken(@Body() dto: RegisterDeviceTokenDto, @CurrentUser() user: User) {
    // Upsert: deactivate old tokens with same value, then create new one
    await this.deviceTokensRepo.update({ token: dto.token }, { isActive: false });
    const deviceToken = this.deviceTokensRepo.create({
      userId: user.id,
      token: dto.token,
      platform: dto.platform,
      isActive: true,
    });
    const saved = await this.deviceTokensRepo.save(deviceToken);
    return ok(saved, 'Device token registered');
  }

  @Put('preferences')
  async updatePreferences(@Body() dto: UpdateNotificationPreferencesDto, @CurrentUser() user: User) {
    let pref = await this.prefsRepo.findOne({ where: { userId: user.id } });
    if (!pref) {
      pref = this.prefsRepo.create({ userId: user.id });
    }
    Object.assign(pref, dto);
    const saved = await this.prefsRepo.save(pref);
    return ok(saved, 'Preferences updated');
  }

  @Get('preferences')
  async getPreferences(@CurrentUser() user: User) {
    let pref = await this.prefsRepo.findOne({ where: { userId: user.id } });
    if (!pref) {
      pref = this.prefsRepo.create({ userId: user.id });
      pref = await this.prefsRepo.save(pref);
    }
    return ok(pref);
  }
}
