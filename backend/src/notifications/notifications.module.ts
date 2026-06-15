import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  // Exported so reactions/comments/posts can generate notifications (#382/#383/#385).
  exports: [NotificationsService],
})
export class NotificationsModule {}
