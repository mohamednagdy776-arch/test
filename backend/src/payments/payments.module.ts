import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
