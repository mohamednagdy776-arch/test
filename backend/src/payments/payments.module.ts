import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  // TODO: add PaymentsService and PaymentsController
  // Integrate Paymob (Egypt) and Stripe (Global)
  // Always validate transactions server-side — never trust client data
})
export class PaymentsModule {}
