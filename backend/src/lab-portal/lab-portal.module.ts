import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lab } from './entities/lab.entity';
import { LabUser } from './entities/lab-user.entity';
import { LabReferralCode } from './entities/lab-referral-code.entity';
import { LabInvoice } from './entities/lab-invoice.entity';
import { LabPortalService } from './services/lab-portal.service';
import { LabPortalController } from './controllers/lab-portal.controller';
import { LabAdminController } from './controllers/lab-admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lab, LabUser, LabReferralCode, LabInvoice])],
  providers: [LabPortalService],
  controllers: [LabPortalController, LabAdminController],
  exports: [LabPortalService],
})
export class LabPortalModule {}
