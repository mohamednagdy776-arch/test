import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
