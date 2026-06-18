import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalDocument } from './entities/medical-document.entity';
import { MedicalService } from './services/medical.service';
import { MedicalController } from './controllers/medical.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalDocument])],
  providers: [MedicalService],
  controllers: [MedicalController],
  exports: [MedicalService],
})
export class MedicalModule {}
