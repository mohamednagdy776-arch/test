import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacySettings } from '../entities/privacy-settings.entity';
import { NotificationSettings } from '../entities/notification-settings.entity';
import { Block } from '../entities/block.entity';
import { Friendship } from '../../friends/entities/friendship.entity';
import { UpdatePrivacyDto } from '../dto/update-privacy.dto';
import { UpdateAppearanceDto } from '../dto/update-appearance.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notifications.dto';
import { UpdateNewsletterDto } from '../dto/update-newsletter.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PrivacySettings) private privacyRepo: Repository<PrivacySettings>,
    @InjectRepository(NotificationSettings) private notificationRepo: Repository<NotificationSettings>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
    @InjectRepository(Friendship) private friendshipsRepo: Repository<Friendship>,
  ) {}

  // ==================== Privacy Settings ====================
  async getPrivacySettings(userId: string) {
    let settings = await this.privacyRepo.findOne({ where: { user: { id: userId } } });
    if (!settings) {
      // Explicit JS-level defaults so new rows are not at the mercy of the DB
      // column default (which may lag behind entity changes without a migration).
      // #771: messaging defaults to 'friends' (match-gate platform).
      // #779: search engine indexing defaults OFF (matrimonial privacy).
      settings = await this.privacyRepo.save(this.privacyRepo.create({
        user: { id: userId } as any,
        whoCanSendMessages: 'friends' as any,
        allowSearchEngines: false,
      }));
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
    let settings = await this.notificationRepo.findOne({ where: { user: { id: userId } } });
    if (!settings) {
      settings = await this.notificationRepo.save(this.notificationRepo.create({ user: { id: userId } as any }));
    }
    return settings;
  }

  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    // Never actually persisted anywhere -- every change silently reverted to
    // the hardcoded defaults on the next page load/refresh (#217).
    let settings = await this.notificationRepo.findOne({ where: { user: { id: userId } } });
    if (!settings) {
      settings = this.notificationRepo.create({ user: { id: userId } as any });
    }
    Object.assign(settings, dto);
    return this.notificationRepo.save(settings);
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
    // The frontend reads `block.blocked.{name,username}` (BlockedUser interface
    // in settings/privacy/page.tsx) but this returned `user.fullName` — a
    // completely different key path, so `blocked?.username` was always
    // undefined and fell back to the literal string 'unknown' (#198). Also
    // guard b.blocked itself: if that account was since soft-deleted, the
    // relation resolves to null and the old code crashed reading `.id` off it.
    return blocks
      .filter(b => b.blocked != null)
      .map(b => ({
        id: b.id,
        blockedAt: b.blockedAt,
        blocked: {
          id: b.blocked.id,
          username: b.blocked.username,
          name: b.blocked.fullName,
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
    // Blocking should end any existing friendship too (mirrors the
    // now-unused FriendsService.blockUser, which this endpoint is
    // consolidating onto — see #88: the profile "Block" button used to
    // write to a completely different table than this one, so blocked
    // users never showed up in Settings > Blocked Accounts).
    await this.friendshipsRepo
      .createQueryBuilder()
      .delete()
      .where('(requester_id = :r AND addressee_id = :a) OR (requester_id = :a AND addressee_id = :r)', {
        r: blockerId,
        a: blockedUserId,
      })
      .execute();
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