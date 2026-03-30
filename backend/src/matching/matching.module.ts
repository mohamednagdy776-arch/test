import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from './entities/match.entity';
import { MatchingService } from './services/matching.service';
import { MatchingController } from './controllers/matching.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Match])],
  providers: [MatchingService],
  controllers: [MatchingController],
})
export class MatchingModule {}
