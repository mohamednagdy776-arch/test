import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
  ) {}

  async findByUser(userId: string) {
    return this.subscriptionRepo.find({
      where: { user: { id: userId } },
      order: { startDate: 'DESC' },
    });
  }

  async findActiveByUser(userId: string) {
    return this.subscriptionRepo.findOne({
      where: { user: { id: userId }, status: 'active' },
      order: { startDate: 'DESC' },
    });
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.subscriptionRepo.findAndCount({
      order: { startDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
    return { data, total };
  }

  async create(userId: string, dto: CreateSubscriptionDto) {
    const subscription = this.subscriptionRepo.create({
      ...dto,
      user: { id: userId } as any,
      startDate: new Date(),
      endDate: dto.endDate ? new Date(dto.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return this.subscriptionRepo.save(subscription);
  }

  async update(id: string, dto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionRepo.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    Object.assign(subscription, dto);
    return this.subscriptionRepo.save(subscription);
  }

  async cancel(id: string) {
    const subscription = await this.subscriptionRepo.findOne({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    subscription.status = 'cancelled';
    return this.subscriptionRepo.save(subscription);
  }
}
