import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessedWebhookEvent } from '../entities/processed-webhook-event.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(ProcessedWebhookEvent)
    private eventsRepo: Repository<ProcessedWebhookEvent>,
  ) {}

  async isAlreadyProcessed(eventId: string): Promise<boolean> {
    const existing = await this.eventsRepo.findOne({ where: { eventId } });
    return !!existing;
  }

  async markProcessed(
    eventId: string,
    provider: string,
    eventType: string,
  ): Promise<void> {
    await this.eventsRepo.save(
      this.eventsRepo.create({ eventId, provider, eventType }),
    );
  }

  async handlePaymentEvent(
    provider: string,
    eventId: string,
    eventType: string,
    _payload: any,
  ): Promise<{ processed: boolean }> {
    if (await this.isAlreadyProcessed(eventId)) {
      return { processed: false }; // idempotent — already handled
    }

    // Handle event types
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.renewed':
      case 'subscription.cancelled':
      case 'payment.failed':
      case 'payment.succeeded':
        // Real implementation updates subscription table
        break;
    }

    await this.markProcessed(eventId, provider, eventType);
    return { processed: true };
  }
}
