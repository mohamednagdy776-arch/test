import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoAccessRequest } from './entities/photo-access-request.entity';
import { Friendship, FriendshipStatus } from '../friends/entities/friendship.entity';
import { Interest } from '../interests/entities/interest.entity';

export type PhotoVisibility = 'public' | 'matches_only' | 'on_request' | 'private';

@Injectable()
export class PhotoPrivacyService {
  constructor(
    @InjectRepository(PhotoAccessRequest) private accessRepo: Repository<PhotoAccessRequest>,
    @InjectRepository(Friendship) private friendshipsRepo: Repository<Friendship>,
    @InjectRepository(Interest) private interestsRepo: Repository<Interest>,
  ) {}

  // Decide whether `viewerId` may see `ownerId`'s photos under `visibility`.
  async canViewPhoto(viewerId: string | undefined, ownerId: string, visibility: PhotoVisibility): Promise<boolean> {
    if (viewerId && viewerId === ownerId) return true;
    switch (visibility) {
      case 'public':
        return true;
      case 'private':
        return false;
      case 'on_request': {
        if (!viewerId) return false;
        const approved = await this.accessRepo.findOne({
          where: { requesterId: viewerId, ownerId, status: 'approved' },
        });
        return !!approved;
      }
      case 'matches_only': {
        if (!viewerId) return false;
        return (await this.isMatched(viewerId, ownerId)) || (await this.hasMutualInterest(viewerId, ownerId));
      }
      default:
        return true;
    }
  }

  private async isMatched(a: string, b: string): Promise<boolean> {
    const count = await this.friendshipsRepo.count({
      where: [
        { requesterId: a, addresseeId: b, status: FriendshipStatus.ACCEPTED },
        { requesterId: b, addresseeId: a, status: FriendshipStatus.ACCEPTED },
      ],
    });
    return count > 0;
  }

  private async hasMutualInterest(a: string, b: string): Promise<boolean> {
    const count = await this.interestsRepo.count({
      where: [
        { senderId: a, receiverId: b, status: 'mutual' },
        { senderId: b, receiverId: a, status: 'mutual' },
      ],
    });
    return count > 0;
  }

  async requestAccess(requesterId: string, ownerId: string) {
    let req = await this.accessRepo.findOne({ where: { requesterId, ownerId } });
    if (!req) {
      req = this.accessRepo.create({ requesterId, ownerId, status: 'pending' });
    } else if (req.status === 'denied') {
      req.status = 'pending';
    }
    await this.accessRepo.save(req);
    return { status: req.status };
  }

  async respond(ownerId: string, requestId: string, approve: boolean) {
    const req = await this.accessRepo.findOne({ where: { id: requestId, ownerId } });
    if (!req) throw new NotFoundException('Request not found');
    req.status = approve ? 'approved' : 'denied';
    await this.accessRepo.save(req);
    return { status: req.status };
  }

  async getIncoming(ownerId: string) {
    const rows = await this.accessRepo.find({
      where: { ownerId, status: 'pending' },
      relations: ['requester', 'requester.profile'],
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      user: r.requester
        ? {
            id: r.requester.id,
            username: r.requester.username ?? null,
            fullName:
              (r.requester.profile?.fullName && r.requester.profile.fullName.trim()) ||
              `${r.requester.firstName ?? ''} ${r.requester.lastName ?? ''}`.trim() ||
              null,
          }
        : null,
    }));
  }
}
