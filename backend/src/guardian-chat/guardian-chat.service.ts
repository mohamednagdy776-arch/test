import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuardianOversight } from './guardian-oversight.entity';
import { User } from '../auth/entities/user.entity';
import { ChatService } from '../chat/services/chat.service';

function publicUser(u?: User | null) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username ?? null,
    fullName:
      (u.profile?.fullName && u.profile.fullName.trim()) ||
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() ||
      u.fullName ||
      null,
  };
}

@Injectable()
export class GuardianChatService {
  constructor(
    @InjectRepository(GuardianOversight) private repo: Repository<GuardianOversight>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private chatService: ChatService,
  ) {}

  async setGuardian(wardId: string, guardianId: string) {
    if (wardId === guardianId) throw new BadRequestException('You cannot be your own guardian');
    const guardian = await this.usersRepo.findOne({ where: { id: guardianId } });
    if (!guardian) throw new BadRequestException('Guardian not found');

    let row = await this.repo.findOne({ where: { wardId } });
    if (!row) {
      row = this.repo.create({ wardId, guardianId, mode: 'awareness', status: 'active' });
    } else {
      row.guardianId = guardianId;
      row.status = 'active';
    }
    await this.repo.save(row);
    return { status: 'active' as const };
  }

  async removeGuardian(wardId: string) {
    await this.repo.delete({ wardId });
    return { success: true };
  }

  async getMyGuardian(wardId: string) {
    const row = await this.repo.findOne({ where: { wardId, status: 'active' }, relations: ['guardian', 'guardian.profile'] });
    if (!row) return { guardian: null };
    return { guardian: publicUser(row.guardian), mode: row.mode };
  }

  async getWards(guardianId: string) {
    const rows = await this.repo.find({ where: { guardianId, status: 'active' } });
    const wardIds = rows.map((r) => r.wardId);
    if (wardIds.length === 0) return [];
    const wards = await this.usersRepo.findByIds(wardIds);
    return wards.map((w) => publicUser(w));
  }

  // Whether a user currently has an active guardian — drives the per-conversation
  // "guardian present" trust indicator.
  async isSupervised(userId: string): Promise<boolean> {
    return (await this.repo.count({ where: { wardId: userId, status: 'active' } })) > 0;
  }

  // A guardian's awareness view of a ward's conversations (who + when), gated by
  // an active oversight. Message bodies are intentionally NOT included here.
  async getWardConversations(guardianId: string, wardId: string) {
    const oversight = await this.repo.findOne({ where: { guardianId, wardId, status: 'active' } });
    if (!oversight) throw new ForbiddenException('You do not oversee this user');
    const convos: any[] = await this.chatService.getConversations(wardId);
    // Strip any last-message content — awareness mode is metadata-only.
    return convos.map((c) => ({
      id: c.id,
      otherUser: c.otherUser ?? c.participant ?? null,
      updatedAt: c.updatedAt ?? c.lastMessageAt ?? null,
    }));
  }
}
