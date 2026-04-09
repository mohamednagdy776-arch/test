import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship, FriendList, UserBlock, UserRestriction, FriendshipStatus, FriendListType } from '../entities/friendship.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship) private friendshipsRepo: Repository<Friendship>,
    @InjectRepository(FriendList) private friendListsRepo: Repository<FriendList>,
    @InjectRepository(UserBlock) private blocksRepo: Repository<UserBlock>,
    @InjectRepository(UserRestriction) private restrictionsRepo: Repository<UserRestriction>,
  ) {}

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

    const isBlocked = await this.blocksRepo.findOne({
      where: [{ blockerId: addresseeId, blockedId: requesterId }, { blockerId: requesterId, blockedId: addresseeId }],
    });
    if (isBlocked) {
      throw new ForbiddenException('Cannot send friend request');
    }

    const friendship = this.friendshipsRepo.create({ requesterId, addresseeId, status: FriendshipStatus.PENDING });
    return this.friendshipsRepo.save(friendship);
  }

  async acceptRequest(userId: string, requestId: string) {
    const friendship = await this.friendshipsRepo.findOne({ where: { id: requestId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.addresseeId !== userId) throw new ForbiddenException('Not authorized');
    if (friendship.status !== FriendshipStatus.PENDING) throw new BadRequestException('Request not pending');

    friendship.status = FriendshipStatus.ACCEPTED;
    return this.friendshipsRepo.save(friendship);
  }

  async declineRequest(userId: string, requestId: string) {
    const friendship = await this.friendshipsRepo.findOne({ where: { id: requestId } });
    if (!friendship) throw new NotFoundException('Friend request not found');
    if (friendship.addresseeId !== userId) throw new ForbiddenException('Not authorized');

    friendship.status = FriendshipStatus.DECLINED;
    return this.friendshipsRepo.save(friendship);
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

    const friendList = friends.map(f => f.requesterId === userId ? f.addressee : f.requester);
    return { data: friendList, total };
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
    const friends = await this.getFriends(userId, 1, 500);
    const friendIds = friends.data.map(f => f.id);

    const suggestions = await this.friendshipsRepo
      .createQueryBuilder('f')
      .select('f.addresseeId', 'userId')
      .addSelect('COUNT(f.requesterId)', 'mutual')
      .where('f.requesterId IN (:...friendIds)', { friendIds })
      .andWhere('f.status = :status', { status: FriendshipStatus.ACCEPTED })
      .andWhere('f.addresseeId NOT IN (:...excludeIds)', { excludeIds: [userId, ...friendIds] })
      .groupBy('f.addresseeId')
      .orderBy('mutual', 'DESC')
      .limit(limit)
      .getRawMany();

    return suggestions;
  }

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) throw new BadRequestException('Cannot block yourself');

    const existing = await this.blocksRepo.findOne({
      where: { blockerId, blockedId },
    });
    if (existing) return existing;

    const block = this.blocksRepo.create({ blockerId, blockedId });
    await this.friendshipsRepo
      .createQueryBuilder()
      .delete()
      .where('(requester_id = :r AND addressee_id = :a) OR (requester_id = :a AND addressee_id = :r)', { r: blockerId, a: blockedId })
      .execute();

    return this.blocksRepo.save(block);
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const block = await this.blocksRepo.findOne({ where: { blockerId, blockedId } });
    if (!block) throw new NotFoundException('Block not found');
    await this.blocksRepo.delete(block.id);
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

  async getFriendLists(userId: string) {
    return this.friendListsRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
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

  async followUser(followerId: string, followedId: string) {
    if (followerId === followedId) throw new BadRequestException('Cannot follow yourself');
    return this.sendRequest(followerId, followedId);
  }

  async unfollowUser(followerId: string, followedId: string) {
    return this.deleteFriendship(followerId, followedId);
  }

  async getFriendshipStatus(userId: string, otherUserId: string) {
    const friendship = await this.friendshipsRepo.findOne({
      where: [
        { requesterId: userId, addresseeId: otherUserId },
        { requesterId: otherUserId, addresseeId: userId },
      ],
    });

    if (!friendship) return { status: 'none' };
    return { status: friendship.status, id: friendship.id };
  }
}