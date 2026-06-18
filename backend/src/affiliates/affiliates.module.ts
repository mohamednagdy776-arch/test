import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliatesService } from './services/affiliates.service';
import { AffiliatesController } from './controllers/affiliates.controller';
import { AffiliatesAdminController } from './controllers/affiliates-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate])],
  providers: [AffiliatesService],
  controllers: [AffiliatesController, AffiliatesAdminController],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}
