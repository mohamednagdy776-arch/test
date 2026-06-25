import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportsService } from './services/reports.service';
import { ReportsController } from './controllers/reports.controller';
import { ReportsPublicController } from './controllers/reports-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Report])],
  providers: [ReportsService],
  controllers: [ReportsController, ReportsPublicController],
  exports: [ReportsService],
})
export class ReportsModule {}
