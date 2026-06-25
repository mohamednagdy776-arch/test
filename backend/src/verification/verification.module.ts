import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityVerification } from './entities/identity-verification.entity';
import { Profile } from '../users/entities/profile.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([IdentityVerification, Profile])],
  providers: [VerificationService],
  controllers: [VerificationController],
})
export class VerificationModule {}
