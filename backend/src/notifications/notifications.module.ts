import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  // TODO: add NotificationsService and NotificationsController
  // Integrate Firebase Cloud Messaging (FCM) for push notifications
})
export class NotificationsModule {}
