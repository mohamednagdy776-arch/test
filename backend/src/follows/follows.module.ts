import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../auth/entities/user.entity';
import { FollowsService } from './services/follows.service';
import { FollowsController } from './controllers/follows.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User]), NotificationsModule, SettingsModule, FriendsModule],
  providers: [FollowsService],
  controllers: [FollowsController],
  exports: [FollowsService],
})
export class FollowsModule {}
