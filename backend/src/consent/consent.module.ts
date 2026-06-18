import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsentRequest } from './entities/consent-request.entity';
import { ConsentAuditLog } from './entities/consent-audit-log.entity';
import { ConsentService } from './services/consent.service';
import { ConsentController } from './controllers/consent.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentRequest, ConsentAuditLog])],
  providers: [ConsentService],
  controllers: [ConsentController],
  exports: [ConsentService],
})
export class ConsentModule {}
