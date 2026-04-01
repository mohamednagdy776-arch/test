import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

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
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(id);
    return ok(notification, 'Notification marked as read');
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: User) {
    await this.notificationsService.markAllAsRead(user.id);
    return ok(null, 'All notifications marked as read');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.notificationsService.delete(id);
    return ok(null, 'Notification deleted');
  }
}
