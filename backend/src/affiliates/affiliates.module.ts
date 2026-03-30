import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Affiliate } from './entities/affiliate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate])],
  // TODO: add AffiliatesService and AffiliatesController
})
export class AffiliatesModule {}
