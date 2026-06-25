import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interest } from './entities/interest.entity';
import { ProfileView } from './entities/profile-view.entity';
import { User } from '../auth/entities/user.entity';
import { Profile } from '../users/entities/profile.entity';

// Minimal, secret-free shape of a user for interest/viewer lists.
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
    avatarUrl: u.profile?.avatarUrl ?? null,
  };
}

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest) private interestsRepo: Repository<Interest>,
    @InjectRepository(ProfileView) private viewsRepo: Repository<ProfileView>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
  ) {}

  // Accept a UUID or a username (profiles link by username); returns the UUID.
  async resolveUserId(idOrUsername: string): Promise<string | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);
    if (isUuid) return idOrUsername;
    const u = await this.usersRepo.findOne({ where: { username: idOrUsername }, select: { id: true } });
    return u?.id ?? null;
  }

  // "Send Salam": express directed interest. Reciprocal interest → both `mutual`.
  async sendInterest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException('You cannot send interest to yourself');

    const reciprocal = await this.interestsRepo.findOne({
      where: { senderId: receiverId, receiverId: senderId },
    });

    let interest = await this.interestsRepo.findOne({ where: { senderId, receiverId } });
    if (!interest) {
      interest = this.interestsRepo.create({ senderId, receiverId, status: 'pending' });
    } else if (interest.status === 'withdrawn') {
      interest.status = 'pending';
    }

    const mutual = !!reciprocal && reciprocal.status !== 'withdrawn';
    if (mutual) {
      interest.status = 'mutual';
      reciprocal!.status = 'mutual';
      await this.interestsRepo.save(reciprocal!);
    }
    await this.interestsRepo.save(interest);
    return { status: interest.status, mutual };
  }

  async withdraw(senderId: string, receiverId: string) {
    await this.interestsRepo.update({ senderId, receiverId }, { status: 'withdrawn' });
    // If it was mutual, demote the other side back to pending.
    await this.interestsRepo.update(
      { senderId: receiverId, receiverId: senderId, status: 'mutual' },
      { status: 'pending' },
    );
    return { success: true };
  }

  async getReceived(userId: string) {
    const rows = await this.interestsRepo.find({
      where: { receiverId: userId },
      relations: ['sender', 'sender.profile'],
      order: { createdAt: 'DESC' },
    });
    return rows
      .filter((r) => r.status !== 'withdrawn')
      .map((r) => ({ id: r.id, status: r.status, createdAt: r.createdAt, user: publicUser(r.sender) }));
  }

  async getSent(userId: string) {
    const rows = await this.interestsRepo.find({
      where: { senderId: userId },
      relations: ['receiver', 'receiver.profile'],
      order: { createdAt: 'DESC' },
    });
    return rows
      .filter((r) => r.status !== 'withdrawn')
      .map((r) => ({ id: r.id, status: r.status, createdAt: r.createdAt, user: publicUser(r.receiver) }));
  }

  // Upsert a profile view (one row per viewer→profile, latest time wins).
  async recordView(viewerId: string, profileId: string) {
    if (!viewerId || viewerId === profileId) return;
    // Incognito viewers leave no trace (#757).
    const viewerProfile = await this.profilesRepo.findOne({
      where: { user: { id: viewerId } },
      select: { id: true, incognito: true },
    });
    if (viewerProfile?.incognito) return;
    const existing = await this.viewsRepo.findOne({ where: { viewerId, profileId } });
    if (existing) {
      existing.viewedAt = new Date();
      await this.viewsRepo.save(existing);
    } else {
      await this.viewsRepo.save(this.viewsRepo.create({ viewerId, profileId }));
    }
  }

  async getProfileViews(userId: string, page = 1, limit = 20) {
    const [rows, total] = await this.viewsRepo.findAndCount({
      where: { profileId: userId },
      relations: ['viewer', 'viewer.profile'],
      order: { viewedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: rows.map((r) => ({ id: r.id, viewedAt: r.viewedAt, user: publicUser(r.viewer) })),
      total,
    };
  }
}
