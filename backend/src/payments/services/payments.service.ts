import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
  ) {}

  async findAll(page: number, limit: number, adminId?: string) {
    // Audit trail: record which admin accessed financial records (PCI/GDPR).
    this.logger.log(`ADMIN_VIEW_PAYMENTS admin=${adminId ?? 'unknown'} page=${page} limit=${limit}`);
    const [data, total] = await this.txRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
    return { data, total };
  }
}
