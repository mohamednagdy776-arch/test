import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacySettings } from '../entities/privacy-settings.entity';
import { Block } from '../entities/block.entity';
import { UpdatePrivacyDto } from '../dto/update-privacy.dto';
import { UpdateAppearanceDto } from '../dto/update-appearance.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notifications.dto';
import { UpdateNewsletterDto } from '../dto/update-newsletter.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PrivacySettings) private privacyRepo: Repository<PrivacySettings>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
  ) {}

  // ==================== Privacy Settings ====================
  async getPrivacySettings(userId: string) {
    let settings = await this.privacyRepo.findOne({ where: { user: { id: userId } } });
    if (!settings) {
      settings = await this.privacyRepo.save(this.privacyRepo.create({ user: { id: userId } as any }));
    }
    return settings;
  }

  async updatePrivacySettings(userId: string, dto: UpdatePrivacyDto) {
    let settings = await this.privacyRepo.findOne({ where: { user: { id: userId } } });
    if (!settings) {
      settings = this.privacyRepo.create({ user: { id: userId } as any });
    }
    Object.assign(settings, dto);
    return this.privacyRepo.save(settings);
  }

  // ==================== Appearance Settings ====================
  async getAppearanceSettings(userId: string) {
    // For now, return defaults since we don't have a dedicated appearance entity
    // In production, this would come from a user_appearance_settings table
    return {
      theme: 'light',
      colorScheme: 'emerald',
      reducedMotion: false,
      highContrast: false,
      largeText: false,
      fontFamily: 'default',
    };
  }

  async updateAppearanceSettings(userId: string, dto: UpdateAppearanceDto) {
    // In production, persist to user_appearance_settings table
    // For now, return the updated settings
    const current = await this.getAppearanceSettings(userId);
    return { ...current, ...dto };
  }

  // ==================== Notification Settings ====================
  async getNotificationSettings(userId: string) {
    // For now, return defaults since we don't have a dedicated notification settings entity
    // In production, this would come from a user_notification_settings table
    return {
      notificationsEnabled: true,
      likesNotifications: true,
      commentsNotifications: true,
      friendRequestsNotifications: true,
      messagesNotifications: true,
      mentionsNotifications: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    };
  }

  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    // In production, persist to user_notification_settings table
    // For now, return the updated settings
    const current = await this.getNotificationSettings(userId);
    return { ...current, ...dto };
  }

  // ==================== Newsletter Settings ====================
  async getNewsletterSettings(userId: string) {
    // For now, return defaults
    // In production, this would come from a user_newsletter_settings table
    return {
      newsletterEnabled: true,
      weeklyDigest: true,
      newFeaturesUpdates: true,
      promotionsOffers: false,
      eventsAndCommunities: true,
      securityAlerts: true,
    };
  }

  async updateNewsletterSettings(userId: string, dto: UpdateNewsletterDto) {
    // In production, persist to user_newsletter_settings table
    // For now, return the updated settings
    const current = await this.getNewsletterSettings(userId);
    return { ...current, ...dto };
  }

  // ==================== Block Management ====================
  async getBlockedUsers(userId: string) {
    const blocks = await this.blockRepo.find({
      where: { blocker: { id: userId } },
      relations: ['blocked'],
      order: { blockedAt: 'DESC' },
    });
    return blocks.map(b => ({
      id: b.id,
      blockedAt: b.blockedAt,
      user: {
        id: b.blocked.id,
        username: b.blocked.username,
        fullName: b.blocked.fullName,
      },
    }));
  }

  async blockUser(blockerId: string, blockedUserId: string) {
    if (blockerId === blockedUserId) {
      throw new ConflictException('Cannot block yourself');
    }
    const existing = await this.blockRepo.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedUserId } },
    });
    if (existing) {
      throw new ConflictException('User already blocked');
    }
    const block = this.blockRepo.create({
      blocker: { id: blockerId } as any,
      blocked: { id: blockedUserId } as any,
    });
    return this.blockRepo.save(block);
  }

  async unblockUser(blockerId: string, blockedUserId: string) {
    const block = await this.blockRepo.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedUserId } },
    });
    if (!block) {
      throw new NotFoundException('Block not found');
    }
    await this.blockRepo.delete(block.id);
  }

  async isBlocked(blockerId: string, userId: string): Promise<boolean> {
    const count = await this.blockRepo.count({
      where: { blocker: { id: blockerId }, blocked: { id: userId } },
    });
    return count > 0;
  }
}