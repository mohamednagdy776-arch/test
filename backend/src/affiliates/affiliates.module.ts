import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './entities/affiliate.entity';
import { AffiliatesService } from './services/affiliates.service';
import { AffiliatesController } from './controllers/affiliates.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate])],
  providers: [AffiliatesService],
  controllers: [AffiliatesController],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}
