import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { PushSubscriptionEntity } from './entities/push-subscription.entity';
import { NotificationsService } from './services/notifications.service';
import { PushService } from './services/push.service';
import { NotificationsController } from './controllers/notifications.controller';
import { PushController } from './controllers/push.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, PushSubscriptionEntity])],
  providers: [NotificationsService, PushService],
  controllers: [NotificationsController, PushController],
  exports: [NotificationsService, PushService],
})
export class NotificationsModule {}
