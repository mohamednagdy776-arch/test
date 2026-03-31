import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Profile } from './entities/profile.entity';
import { User } from '../auth/entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { AvatarController } from './controllers/avatar.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, User]),
    MulterModule.register({}),
  ],
  providers: [UsersService],
  controllers: [UsersController, AvatarController],
  exports: [UsersService],
})
export class UsersModule {}
