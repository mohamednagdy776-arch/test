import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Match } from './entities/match.entity';
import { CompatibilityScore } from './entities/compatibility-score.entity';
import { Profile } from '../users/entities/profile.entity';
import { User } from '../auth/entities/user.entity';
import { MatchingService } from './services/matching.service';
import { ColdStartService } from './services/cold-start.service';
import { CompatibilityService } from './services/compatibility.service';
import { GeneticCompatibilityService } from './services/genetic-compatibility.service';
import { BiasMonitorService } from './services/bias-monitor.service';
import { MatchingController } from './controllers/matching.controller';
import { GeneticHealthController } from './controllers/genetic-health.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, CompatibilityScore, Profile, User]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [
    MatchingService,
    ColdStartService,
    CompatibilityService,
    GeneticCompatibilityService,
    BiasMonitorService,
  ],
  controllers: [MatchingController, GeneticHealthController],
  exports: [ColdStartService, CompatibilityService, GeneticCompatibilityService, BiasMonitorService],
})
export class MatchingModule {}
