import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
  ) {}

  async findAll(page: number, limit: number) {
    const [data, total] = await this.txRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
    return { data, total };
  }
}
