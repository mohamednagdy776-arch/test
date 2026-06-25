import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interest } from './entities/interest.entity';
import { ProfileView } from './entities/profile-view.entity';
import { User } from '../auth/entities/user.entity';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Interest, ProfileView, User])],
  providers: [InterestsService],
  controllers: [InterestsController],
  exports: [InterestsService],
})
export class InterestsModule {}
