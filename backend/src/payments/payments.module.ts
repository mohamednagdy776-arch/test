import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { ProcessedWebhookEvent } from './entities/processed-webhook-event.entity';
import { PaymentsService } from './services/payments.service';
import { WebhookService } from './services/webhook.service';
import { PaymentsController } from './controllers/payments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, ProcessedWebhookEvent])],
  providers: [PaymentsService, WebhookService],
  controllers: [PaymentsController],
  exports: [WebhookService],
})
export class PaymentsModule {}
