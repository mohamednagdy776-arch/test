import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrivacySettings } from '../entities/privacy-settings.entity';
import { Block } from '../entities/block.entity';
import { UpdatePrivacyDto } from '../dto/update-privacy.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PrivacySettings) private privacyRepo: Repository<PrivacySettings>,
    @InjectRepository(Block) private blockRepo: Repository<Block>,
  ) {}

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

  async getBlockedUsers(userId: string) {
    return this.blockRepo.find({
      where: { blocker: { id: userId } },
      relations: ['blocked'],
      order: { blockedAt: 'DESC' },
    });
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