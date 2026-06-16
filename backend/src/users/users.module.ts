import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Profile } from './entities/profile.entity';
import { ProfileWork } from './entities/profile-work.entity';
import { ProfileEducation } from './entities/profile-education.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { User } from '../auth/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { PublicProfileController } from './controllers/public-profile.controller';
import { FriendsModule } from '../friends/friends.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, ProfileWork, ProfileEducation, ActivityLog, Post]),
    MulterModule.register({}),
    FriendsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController, PublicProfileController],
  exports: [UsersService],
})
export class UsersModule {}
