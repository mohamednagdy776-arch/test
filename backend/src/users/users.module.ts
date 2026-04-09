import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Profile } from './entities/profile.entity';
import { ProfileWork } from './entities/profile-work.entity';
import { ProfileEducation } from './entities/profile-education.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { User } from '../auth/entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { AvatarController } from './controllers/avatar.controller';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, ProfileWork, ProfileEducation, ActivityLog, User]),
    MulterModule.register({}),
    FriendsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController, AvatarController],
  exports: [UsersService],
})
export class UsersModule {}
