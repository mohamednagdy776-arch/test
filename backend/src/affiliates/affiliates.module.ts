import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliateReferral } from './entities/affiliate-referral.entity';
import { AffiliatePayout } from './entities/affiliate-payout.entity';
import { AffiliatesService } from './services/affiliates.service';
import { AffiliateFraudService } from './services/affiliate-fraud.service';
import { AffiliatesController } from './controllers/affiliates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate, AffiliateReferral, AffiliatePayout])],
  providers: [AffiliatesService, AffiliateFraudService],
  controllers: [AffiliatesController],
  exports: [AffiliatesService, AffiliateFraudService],
})
export class AffiliatesModule {}
