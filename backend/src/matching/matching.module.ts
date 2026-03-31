import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Match } from './entities/match.entity';
import { Profile } from '../users/entities/profile.entity';
import { User } from '../auth/entities/user.entity';
import { MatchingService } from './services/matching.service';
import { MatchingController } from './controllers/matching.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Profile, User]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [MatchingService],
  controllers: [MatchingController],
})
export class MatchingModule {}
