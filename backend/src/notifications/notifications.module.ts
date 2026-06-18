import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { DeviceToken } from './entities/device-token.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsService } from './services/notifications.service';
import { PushService } from './services/push.service';
import { FcmService } from './services/fcm.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';
import { NotificationsController } from './controllers/notifications.controller';
import { PushController } from './controllers/push.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      PushSubscriptionEntity,
      DeviceToken,
      NotificationPreference,
    ]),
  ],
  providers: [NotificationsService, PushService, FcmService, NotificationDispatchService],
  controllers: [NotificationsController, PushController],
  exports: [NotificationsService, PushService, FcmService, NotificationDispatchService],
})
export class NotificationsModule {}
