import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Friendship, FriendList, UserBlock, UserRestriction, FriendshipStatus, FriendListType } from '../entities/friendship.entity';
import { User } from '../../auth/entities/user.entity';
import { Follow } from '../../follows/entities/follow.entity';
import { Block } from '../../settings/entities/block.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship) private friendshipsRepo: Repository<Friendship>,
    @InjectRepository(FriendList) private friendListsRepo: Repository<FriendList>,
    @InjectRepository(UserBlock) private blocksRepo: Repository<UserBlock>,
    @InjectRepository(UserRestriction) private restrictionsRepo: Repository<UserRestriction>,
    @InjectRepository(Follow) private followsRepo: Repository<Follow>,
    @InjectRepository(Block) private userBlockRepo: Repository<Block>,
    private readonly notifications: NotificationsService,
  ) {}

  // Single source of truth for block enforcement: reads the `blocks` table that
  // the user-facing POST /blocks writes to, in BOTH directions (#758).
  async isBlockedEither(userA: string, userB: string): Promise<boolean> {
    if (!userA || !userB || userA === userB) return false;
    // Relation-based `blocks` table (Block entity, via userBlockRepo).
    const count = await this.userBlockRepo.count({
      where: [
        { blocker: { id: userA }, blocked: { id: userB } },
        { blocker: { id: userB }, blocked: { id: userA } },
      ],
    });
    if (count > 0) return true;
    // ALSO check the scalar `user_blocks` table (UserBlock entity, via blocksRepo)
    // that blockUser() actually writes to. The two block tables were disconnected,
    // so a block created via POST /friends/block was never enforced (#28). Guarded
    // so unit tests that only stub one repo still pass.
    if (this.blocksRepo && typeof (this.blocksRepo as any).count === 'function') {
      const scalar = await this.blocksRepo.count({
        where: [
          { blockerId: userA, blockedId: userB } as any,
          { blockerId: userB, blockedId: userA } as any,
        ],
      });
      if (scalar > 0) return true;
    }
    return false;
  }

  async sendRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    const existing = await this.friendshipsRepo.findOne({
      where: [
        { requesterId, addresseeId },
        { requesterId: addresseeId, addresseeId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === FriendshipStatus.BLOCKED) {
        throw new ForbiddenException('Cannot send friend request');
      }
      throw new BadRequestException('Friend request already exists');
    }

    if (await this.isBlockedEither(requesterId, addresseeId)) {
      throw new ForbiddenException('Cannot send friend request');
    }

    const friendship = this.friendshipsRepo.create({ requesterId, addresseeId, status: FriendshipStatus.PENDING });
    const saved = await this.friendshipsRepo.save(friendship);

    // Notify the addressee that they received a friend request — this was
    // never wired up (#84); only acceptRequest notified anyone.
    try {
      await this.notifications.notifyUser(addresseeId, requesterId, 'friend_request', 'أرسل لك طلب صداقة');
    } catch {
      // Never fail the send operation if the notification dispatch fails.
    }

    return saved;
  }

  async acceptRequest(userId: string, requestId: string) {
    const friendship = await this.friendshipsRepo.findOne({ where: { id: requestId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.addresseeId !== userId) throw new ForbiddenException('Not authorized');
    if (friendship.status !== FriendshipStatus.PENDING) throw new BadRequestException('Request not pending');

    friendship.status = FriendshipStatus.ACCEPTED;
    const saved = await this.friendshipsRepo.save(friendship);

    // Auto-follow both directions so feed/follower counts reflect the friendship (#652).
    // Use INSERT ... ON CONFLICT DO NOTHING so pre-existing follows are not duplicated.
    const { requesterId, addresseeId } = friendship;
    await this.followsRepo
      .createQueryBuilder()
      .insert()
      .into(Follow)
      .values([
        { followerId: requesterId, followingId: addresseeId },
        { followerId: addresseeId, followingId: requesterId },
      ])
      .orIgnore()
      .execute();

    // Notify the original requester that their friend request was accepted.
    try {
      await this.notifications.notifyUser(requesterId, addresseeId, 'friend_accepted', 'قبل طلب صداقتك');
    } catch {
      // Never fail the accept operation if the notification dispatch fails.
    }

    return saved;
  }

  async declineRequest(userId: string, requestId: string) {
    const friendship = await this.friendshipsRepo.findOne({ where: { id: requestId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.addresseeId !== userId) throw new ForbiddenException('Not authorized');

    // Delete rather than leave status=DECLINED (like cancelRequest already
    // does). A left-behind row hit the `uq_friendship_pair` unique constraint
    // and sendRequest's existing-row check, permanently blocking the
    // requester from ever sending a new request to this person again (#109).
    await this.friendshipsRepo.delete(requestId);
    return { success: true };
  }

  async cancelRequest(userId: string, requestId: string) {
    const friendship = await this.friendshipsRepo.findOne({ where: { id: requestId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.requesterId !== userId) throw new ForbiddenException('Not authorized');

    await this.friendshipsRepo.delete(requestId);
    return { success: true };
  }

  async deleteFriendship(userId: string, friendId: string) {
    const friendship = await this.friendshipsRepo.findOne({
      where: [
        { requesterId: userId, addresseeId: friendId, status: FriendshipStatus.ACCEPTED },
        { requesterId: friendId, addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
    });
    if (!friendship) throw new NotFoundException('Friendship not found');
    await this.friendshipsRepo.delete(friendship.id);
    return { success: true };
  }

  async getFriends(userId: string, page = 1, limit = 20) {
    const [friends, total] = await this.friendshipsRepo.findAndCount({
      where: [
        { requesterId: userId, status: FriendshipStatus.ACCEPTED },
        { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
      relations: ['requester', 'requester.profile', 'addressee', 'addressee.profile'],
      skip: (page - 1) * limit,
      take: limit,
      order: { updatedAt: 'DESC' },
    });

    // If the other side of the friendship soft-deleted their account, TypeORM's
    // relation load resolves to null (deletedAt filtering applies to joined
    // relations too) — that null was passed straight through and crashed the
    // Friends page reading any property off it (#177).
    const friendList = friends
      .map(f => f.requesterId === userId ? f.addressee : f.requester)
      .filter((u): u is NonNullable<typeof u> => u != null);
    return { data: friendList, total };
  }

  // Lightweight, uncapped list of a user's accepted-friend ids. Selects only the
  // id columns (no profile relations, no 1,000-row cap) so callers like the
  // mutual-friends count stay correct and cheap for power users (#165).
  async getFriendIds(userId: string): Promise<string[]> {
    const rows = await this.friendshipsRepo.find({
      where: [
        { requesterId: userId, status: FriendshipStatus.ACCEPTED },
        { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
      ],
      select: { id: true, requesterId: true, addresseeId: true },
    });
    return rows.map((f) => (f.requesterId === userId ? f.addresseeId : f.requesterId));
  }

  async getPendingRequests(userId: string) {
    return this.friendshipsRepo.find({
      where: { addresseeId: userId, status: FriendshipStatus.PENDING },
      relations: ['requester', 'requester.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSentRequests(userId: string) {
    return this.friendshipsRepo.find({
      where: { requesterId: userId, status: FriendshipStatus.PENDING },
      relations: ['addressee', 'addressee.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSuggestions(userId: string, limit = 10) {
    // `limit` comes from `@Query('limit')`; when the param is absent Nest's
    // global transform pipe still coerces it via the reflected `number` type,
    // producing `Number(undefined) = NaN` rather than `undefined` — so the
    // service's own `limit = 10` default parameter never actually applied
    // (defaults only substitute for a literal `undefined`) and `.limit(NaN)`
    // crashed the query with a 500 on every plain `GET /friends/suggestions`
    // call with no explicit `?limit=`. Also rejects non-positive values (#259).
    const take = Number.isFinite(limit) && (limit as number) > 0 ? Math.floor(limit as number) : 10;

    const friendIds = await this.getFriendIds(userId);

    // No friends yet → cannot compute mutual-friend suggestions.
    // Empty arrays would produce invalid SQL `IN ()`, so guard explicitly.
    if (friendIds.length === 0) {
      return [];
    }

    // Previously only matched rows where the friend was the REQUESTER
    // (`f.requesterId IN friendIds`), silently missing every friend-of-friend
    // reachable through a friendship the friend had only *accepted* rather
    // than sent — i.e. half of all real candidates, depending on which side
    // of that row happened to be the requester (#259).
    const rows = await this.friendshipsRepo
      .createQueryBuilder('f')
      .select('f.requesterId', 'requesterId')
      .addSelect('f.addresseeId', 'addresseeId')
      .where('f.status = :status', { status: FriendshipStatus.ACCEPTED })
      .andWhere('(f.requesterId IN (:...friendIds) OR f.addresseeId IN (:...friendIds))', { friendIds })
      .getRawMany<{ requesterId: string; addresseeId: string }>();

    const friendIdSet = new Set(friendIds);
    const excludeIds = new Set([userId, ...friendIds]);
    const mutualCounts = new Map<string, number>();
    for (const row of rows) {
      const { requesterId, addresseeId } = row;
      if (friendIdSet.has(requesterId) && !excludeIds.has(addresseeId)) {
        mutualCounts.set(addresseeId, (mutualCounts.get(addresseeId) ?? 0) + 1);
      }
      if (friendIdSet.has(addresseeId) && !excludeIds.has(requesterId)) {
        mutualCounts.set(requesterId, (mutualCounts.get(requesterId) ?? 0) + 1);
      }
    }

    const topCandidateIds = [...mutualCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, take)
      .map(([id]) => id);

    if (topCandidateIds.length === 0) return [];

    // The frontend renders each suggestion's name/avatar off `s.userId` as a
    // hydrated user object (`displayName(user)`, `user.userId?.avatar`) —
    // the previous version returned a bare id string, so every card fell
    // back to a placeholder name with no avatar.
    const users = await this.friendshipsRepo.manager.getRepository(User).find({
      where: topCandidateIds.map((id) => ({ id })),
      relations: ['profile'],
    });
    const usersById = new Map(users.map((u) => [u.id, u]));

    return topCandidateIds
      .filter((id) => usersById.has(id))
      .map((id) => ({ userId: usersById.get(id), mutual: mutualCounts.get(id) ?? 0 }));
  }

  // Writes to `user_blocks` (via blocksRepo/UserBlock) — a different table
  // than the one every enforcement check and the Blocked Accounts list reads
  // (`blocks`, via userBlockRepo/Block; see isBlockedEither above and #758).
  // POST /friends/block is the Friends page's Block button, so blocking from
  // there silently didn't count anywhere else: the conversation stayed in
  // Messages, the user stayed in Followers, etc. (#168, #203). Switch this
  // write path onto the same canonical table settings/blocks already uses.
  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new BadRequestException('Cannot block yourself');

    const existing = await this.userBlockRepo.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });
    if (existing) return existing;

    const block = this.userBlockRepo.create({
      blocker: { id: blockerId } as any,
      blocked: { id: blockedId } as any,
    });
    await this.friendshipsRepo
      .createQueryBuilder()
      .delete()
      .where('(requester_id = :r AND addressee_id = :a) OR (requester_id = :a AND addressee_id = :r)', { r: blockerId, a: blockedId })
      .execute();

    return this.userBlockRepo.save(block);
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const block = await this.userBlockRepo.findOne({
      where: { blocker: { id: blockerId }, blocked: { id: blockedId } },
    });
    if (!block) throw new NotFoundException('Block not found');
    await this.userBlockRepo.delete(block.id);
    return { success: true };
  }

  async isBlocked(userId: string, otherUserId: string) {
    const block = await this.blocksRepo.findOne({
      where: [{ blockerId: userId, blockedId: otherUserId }, { blockerId: otherUserId, blockedId: userId }],
    });
    return !!block;
  }

  async restrictUser(userId: string, restrictedId: string, restrictPosts = true, restrictMessages = true) {
    let restriction = await this.restrictionsRepo.findOne({ where: { userId, restrictedId } });
    if (restriction) {
      restriction.restrictPosts = restrictPosts;
      restriction.restrictMessages = restrictMessages;
    } else {
      restriction = this.restrictionsRepo.create({ userId, restrictedId, restrictPosts, restrictMessages });
    }
    return this.restrictionsRepo.save(restriction);
  }

  async unrestrictUser(userId: string, restrictedId: string) {
    const restriction = await this.restrictionsRepo.findOne({ where: { userId, restrictedId } });
    if (!restriction) throw new NotFoundException('Restriction not found');
    await this.restrictionsRepo.delete(restriction.id);
    return { success: true };
  }

  async getRestriction(userId: string, otherUserId: string) {
    return this.restrictionsRepo.findOne({ where: { userId, restrictedId: otherUserId } });
  }

  async createFriendList(userId: string, name: string, type = FriendListType.CUSTOM) {
    const list = this.friendListsRepo.create({ userId, name, type });
    return this.friendListsRepo.save(list);
  }

  // The management UI reads `list.members` (hydrated user objects, for the
  // avatar-stack preview + member count) but this only ever returned the raw
  // `memberIds` string array with no `members` field at all -- every list
  // showed "0 أعضاء" regardless of how many ids were actually saved (#260).
  async getFriendLists(userId: string) {
    const lists = await this.friendListsRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    const allMemberIds = [...new Set(lists.flatMap((l) => l.memberIds || []))];
    if (allMemberIds.length === 0) {
      return lists.map((l) => ({ ...l, members: [] }));
    }
    const users = await this.friendshipsRepo.manager.getRepository(User).find({ where: { id: In(allMemberIds) } });
    const usersById = new Map(users.map((u) => [u.id, u]));
    return lists.map((l) => ({
      ...l,
      members: (l.memberIds || []).map((id) => usersById.get(id)).filter((u): u is User => !!u),
    }));
  }

  async updateFriendList(userId: string, listId: string, data: { name?: string; memberIds?: string[] }) {
    const list = await this.friendListsRepo.findOne({ where: { id: listId, userId } });
    if (!list) throw new NotFoundException('Friend list not found');

    if (data.name) list.name = data.name;
    if (data.memberIds) list.memberIds = data.memberIds;
    return this.friendListsRepo.save(list);
  }

  async deleteFriendList(userId: string, listId: string) {
    const list = await this.friendListsRepo.findOne({ where: { id: listId, userId } });
    if (!list) throw new NotFoundException('Friend list not found');
    await this.friendListsRepo.delete(listId);
    return { success: true };
  }

  // Follow is a one-directional relationship, independent of friendship. It used
  // to alias to sendRequest(), which 400'd ("Friend request already exists") the
  // moment any friendship/request row existed — so the /friends Follow button on
  // an existing friend always failed (#29). Now it writes an idempotent Follow
  // row (mirrors FollowsService.follow): already-following is a clean no-op.
  async followUser(followerId: string, followedId: string) {
    if (followerId === followedId) throw new BadRequestException('Cannot follow yourself');
    const existing = await this.followsRepo.findOne({ where: { followerId, followingId: followedId } });
    if (existing) return { following: true }; // idempotent — no duplicate rows
    await this.followsRepo.save(this.followsRepo.create({ followerId, followingId: followedId }));
    return { following: true };
  }

  async unfollowUser(followerId: string, followedId: string) {
    await this.followsRepo.delete({ followerId, followingId: followedId });
    return { following: false };
  }

  async getFriendshipStatus(userId: string, otherUserId: string) {
    const friendship = await this.friendshipsRepo.findOne({
      where: [
        { requesterId: userId, addresseeId: otherUserId },
        { requesterId: otherUserId, addresseeId: userId },
      ],
    });

    if (!friendship) return { status: 'none' };
    return {
      status: friendship.status,
      id: friendship.id,
      isRequester: friendship.requesterId === userId,
    };
  }

  async getBirthdays(userId: string) {
    const { data: friends } = await this.getFriends(userId, 1, 500);

    const today = new Date();
    const inThirtyDays = new Date(today);
    inThirtyDays.setDate(today.getDate() + 30);

    const upcoming = friends
      .filter((friend: any) => !!friend.dateOfBirth)
      .map((friend: any) => {
        const dob = new Date(friend.dateOfBirth);
        const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        const nextBirthday = thisYear < today
          ? new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate())
          : thisYear;

        const diffMs = nextBirthday.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        return {
          id: friend.id,
          name: friend.fullName || `${friend.firstName || ''} ${friend.lastName || ''}`.trim() || friend.email?.split('@')[0] || 'مستخدم',
          date: nextBirthday.toISOString().split('T')[0],
          avatar: friend.profile?.avatarUrl || null,
          daysUntil: diffDays,
        };
      })
      .filter((b) => b.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return upcoming;
  }
}