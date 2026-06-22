import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Notification, NotificationType } from '../entities/notification.entity';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  // Notify a target user about an action by `actorId`. Never notifies a user
  // about their own action (e.g. reacting to your own post). Best-effort —
  // notification failures must not break the underlying action (#382/#383).
  async notifyUser(
    targetUserId: string | undefined,
    actorId: string,
    type: NotificationType,
    message: string,
    entityType?: string,
    entityId?: string,
  ) {
    if (!targetUserId || targetUserId === actorId) return;
    try {
      // Dedupe: don't stack multiple identical unread notifications for the same
      // entity (e.g. repeated reactions on one post) — collapse to one (#447).
      if (entityId) {
        const existing = await this.notificationRepo.findOne({
          where: { user: { id: targetUserId }, type, entityId, readStatus: false },
        });
        if (existing) return;
      }
      await this.create(targetUserId, { type, message, entityType, entityId });
    } catch {
      /* best-effort */
    }
  }

  // Parse @username mentions out of free text and notify each mentioned user
  // (excluding the actor). Usernames are [a-zA-Z0-9_] (#385).
  async notifyMentions(content: string | undefined, actorId: string, entityType: string, entityId: string) {
    if (!content) return;
    const usernames = [...new Set((content.match(/@([a-zA-Z0-9_]+)/g) || []).map((m) => m.slice(1)))];
    if (!usernames.length) return;
    try {
      const users = await this.usersRepo.find({ where: { username: In(usernames) } });
      for (const u of users) {
        if (u.id === actorId) continue;
        await this.create(u.id, { type: 'mention', message: 'mentioned you', entityType, entityId });
      }
    } catch {
      /* best-effort */
    }
  }

  async findByUser(userId: string, page: number, limit: number, type?: string) {
    const [data, total] = await this.notificationRepo.findAndCount({
      where: { user: { id: userId }, ...(type ? { type: type as any } : {}) },
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
