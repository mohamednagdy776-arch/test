import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Follow } from '../entities/follow.entity';
import { User } from '../../auth/entities/user.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { SettingsService } from '../../settings/services/settings.service';
import { FriendsService } from '../../friends/services/friends.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private followsRepo: Repository<Follow>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private notifications: NotificationsService,
    private settingsService: SettingsService,
    private friendsService: FriendsService,
  ) {}

  // Confirm a follow target is a real, active, non-deleted account (#395).
  private async assertActiveUser(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId, deletedAt: IsNull() } });
    if (!user || user.isDeactivated) throw new NotFoundException('User not found');
    return user;
  }

  // Enforce the target's "who can follow me" privacy (#480). Fail-open: default/
  // 'public'/any error always allows, so existing behaviour is unchanged.
  private async assertCanFollow(followerId: string, targetId: string) {
    let setting = 'public';
    try {
      const privacy: any = await this.settingsService.getPrivacySettings(targetId);
      setting = privacy?.whoCanFollow ?? 'public';
    } catch {
      return;
    }
    if (setting === 'public' || setting === 'friends_of_friends') return;
    if (setting === 'only_me') {
      throw new ForbiddenException('This user does not allow new followers');
    }
    if (setting === 'friends') {
      const friendIds = await this.friendsService.getFriendIds(targetId);
      if (!friendIds.includes(followerId)) {
        throw new ForbiddenException('Only this user\'s friends can follow them');
      }
    }
  }

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself'); // #378
    }
    await this.assertActiveUser(followingId);
    await this.assertCanFollow(followerId, followingId); // #480

    const existing = await this.followsRepo.findOne({ where: { followerId, followingId } });
    if (existing) return { following: true }; // idempotent — no duplicate rows (#379)

    await this.followsRepo.save(this.followsRepo.create({ followerId, followingId }));
    // Notify the followed user (#384).
    await this.notifications.notifyUser(followingId, followerId, 'follow', 'started following you', 'user', followerId);
    return { following: true };
  }

  async unfollow(followerId: string, followingId: string) {
    await this.followsRepo.delete({ followerId, followingId });
    return { following: false };
  }

  async isFollowing(followerId: string, followingId: string) {
    const row = await this.followsRepo.findOne({ where: { followerId, followingId } });
    return { following: !!row };
  }

  // Followers = users who follow `userId`. Paginated (#380), searchable (#381),
  // and excludes deactivated/deleted accounts (#444).
  async getFollowers(userId: string, page = 1, limit = 20, search?: string) {
    return this.listRelations('followers', userId, page, limit, search);
  }

  // Following = users `userId` follows.
  async getFollowing(userId: string, page = 1, limit = 20, search?: string) {
    return this.listRelations('following', userId, page, limit, search);
  }

  private async listRelations(kind: 'followers' | 'following', userId: string, page: number, limit: number, search?: string) {
    const joinRel = kind === 'followers' ? 'f.follower' : 'f.following';
    // Match on the entity property name (TypeORM maps it to the column).
    const matchProp = kind === 'followers' ? 'f.followingId' : 'f.followerId';

    const qb = this.followsRepo
      .createQueryBuilder('f')
      .leftJoinAndSelect(joinRel, 'u')
      .leftJoinAndSelect('u.profile', 'p')
      .where(`${matchProp} = :userId`, { userId })
      .andWhere('u.isDeactivated = false')
      .andWhere('u.deletedAt IS NULL');

    if (search) {
      qb.andWhere('(u.username ILIKE :s OR p.fullName ILIKE :s)', { s: `%${search}%` });
    }

    const [rows, total] = await qb
      .orderBy('f.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = rows.map((r) => (kind === 'followers' ? r.follower : r.following));
    return { data, total, page, totalPages: Math.ceil(total / limit) };
  }

  // Follower/following counts excluding deactivated/deleted accounts (#444).
  async getCounts(userId: string) {
    const followers = await this.followsRepo
      .createQueryBuilder('f')
      .innerJoin('f.follower', 'u')
      .where('f.followingId = :userId', { userId })
      .andWhere('u.isDeactivated = false')
      .andWhere('u.deletedAt IS NULL')
      .getCount();

    const following = await this.followsRepo
      .createQueryBuilder('f')
      .innerJoin('f.following', 'u')
      .where('f.followerId = :userId', { userId })
      .andWhere('u.isDeactivated = false')
      .andWhere('u.deletedAt IS NULL')
      .getCount();

    return { followers, following };
  }
}
