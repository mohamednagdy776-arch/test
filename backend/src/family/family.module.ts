import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyRelationship } from './entities/family-relationship.entity';
import { FamilyService } from './services/family.service';
import { FamilyController } from './controllers/family.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyRelationship])],
  providers: [FamilyService],
  controllers: [FamilyController],
  exports: [FamilyService],
})
export class FamilyModule {}
