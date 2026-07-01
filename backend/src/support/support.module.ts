import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportReport } from './entities/support-report.entity';
import { SupportService } from './services/support.service';
import { SupportController } from './controllers/support.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SupportReport])],
  providers: [SupportService],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}
