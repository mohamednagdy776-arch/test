import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
  ) {}

  async findByUser(userId: string, page: number, limit: number) {
    const [data, total] = await this.notificationRepo.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findUnreadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { user: { id: userId }, readStatus: false },
    });
    return count;
  }

  async create(userId: string, dto: CreateNotificationDto) {
    const notification = this.notificationRepo.create({
      ...dto,
      user: { id: userId } as any,
      readStatus: false,
    });
    return this.notificationRepo.save(notification);
  }

  async markAsRead(id: string, userId: string) {
    // Scope by owner so a user can't read-mark another user's notification.
    const notification = await this.notificationRepo.findOne({ where: { id, user: { id: userId } } });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.readStatus = true;
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { user: { id: userId } as any, readStatus: false },
      { readStatus: true },
    );
  }

  async delete(id: string, userId: string) {
    // Scope by owner so a user can't delete another user's notification.
    const result = await this.notificationRepo.delete({ id, user: { id: userId } as any });
    if (!result.affected) throw new NotFoundException('Notification not found');
  }
}
