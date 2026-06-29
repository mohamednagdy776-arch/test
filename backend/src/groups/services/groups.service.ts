import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, In } from 'typeorm';

// Cap free-text search terms so a giant ILIKE '%...%' (which can't use an index)
// can't be used as a DoS vector.
const MAX_SEARCH_LEN = 100;
import { Group, GroupPrivacy } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupsRepo: Repository<Group>,
    @InjectRepository(GroupMember) private memberRepo: Repository<GroupMember>,
  ) {}

  async create(dto: CreateGroupDto, user: User) {
    const group = this.groupsRepo.create({ ...dto, createdBy: user });
    const saved = await this.groupsRepo.save(group);
    // Auto-join creator
    await this.memberRepo.save(this.memberRepo.create({
      group: { id: saved.id } as any,
      user,
    }));
    return saved;
  }

  // Attach the real member count to a list of groups in ONE grouped query.
  // List endpoints returned raw Group rows with no memberCount, so every card
  // rendered "0 members" while only the detail page (which counts separately)
  // was correct (#34). Pending join requests are excluded so the count matches
  // actual membership.
  private async attachMemberCounts<T extends { id: string }>(groups: T[]): Promise<(T & { memberCount: number })[]> {
    if (groups.length === 0) return groups as any;
    const rows = await this.memberRepo
      .createQueryBuilder('m')
      .leftJoin('m.group', 'g')
      .select('g.id', 'gid')
      .addSelect('COUNT(m.id)', 'cnt')
      .where('g.id IN (:...ids)', { ids: groups.map((g) => g.id) })
      .andWhere('m.status = :active', { active: 'active' })
      .groupBy('g.id')
      .getRawMany();
    const countById = new Map(rows.map((r: any) => [r.gid, Number(r.cnt)]));
    return groups.map((g) => ({ ...g, memberCount: countById.get(g.id) || 0 }));
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.groupsRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data: await this.attachMemberCounts(data), total };
  }

  async search(query: string, userId: string) {
    if (!query || query.trim().length === 0) {
      return { joinedGroups: [], otherGroups: [] };
    }

    const searchTerm = `%${query.trim().slice(0, MAX_SEARCH_LEN)}%`;

    // Get all groups matching the search
    const allGroups = await this.groupsRepo
      .createQueryBuilder('group')
      .where('group.name ILIKE :search OR group.description ILIKE :search', { search: searchTerm })
      .orderBy('group.name', 'ASC')
      .limit(30)
      .getMany();

    // Get user's joined group IDs
    const memberships = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['group'],
    });
    const joinedGroupIds = new Set(memberships.map(m => m.group.id));

    const joinedGroups = allGroups.filter(g => joinedGroupIds.has(g.id));
    const otherGroups = allGroups.filter(g => !joinedGroupIds.has(g.id));

    return {
      joinedGroups: await this.attachMemberCounts(joinedGroups),
      otherGroups: await this.attachMemberCounts(otherGroups),
    };
  }

  async autocomplete(query: string) {
    if (!query || query.trim().length === 0) return [];

    return this.groupsRepo
      .createQueryBuilder('group')
      .where('group.name ILIKE :search', { search: `%${query.trim().slice(0, MAX_SEARCH_LEN)}%` })
      .select(['group.id', 'group.name'])
      .orderBy('group.name', 'ASC')
      .limit(8)
      .getMany();
  }

  async findOne(groupId: string, userId: string) {
    const group = await this.groupsRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    const isMember = await this.isMember(groupId, userId);
    const memberCount = await this.getMemberCount(groupId);

    return { ...group, isMember, memberCount };
  }

  async join(groupId: string, user: User) {
    const group = await this.groupsRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');

    // Secret groups are invite-only and aren't even discoverable, so a direct
    // join attempt is still rejected. Public groups join instantly; private
    // groups create a PENDING join request awaiting admin approval (#36) — the
    // old code 403'd private joins outright, so the Join button did nothing.
    if (group.privacy === 'secret') {
      throw new ForbiddenException('This group requires an invitation to join');
    }

    const existing = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: user.id } },
    });
    if (existing?.isBanned) throw new ForbiddenException('You have been banned from this group');
    // Idempotent join: a double-clicked Join button used to fire two POSTs, the
    // second 409-ing as an unhandled console error (#734). Already a member (or
    // already pending) is a success — return the group with the current status.
    if (existing) return { ...group, joinStatus: existing.status };

    const status: 'active' | 'pending' = group.privacy === 'private' ? 'pending' : 'active';
    await this.memberRepo.save(this.memberRepo.create({
      group: { id: groupId } as any,
      user,
      status,
    }));
    return { ...group, joinStatus: status };
  }

  async leave(groupId: string, userId: string) {
    const member = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
    if (!member) throw new NotFoundException('Not a member');
    await this.memberRepo.delete(member.id);
  }

  async getMyGroups(userId: string) {
    const memberships = await this.memberRepo.find({
      where: { user: { id: userId }, status: 'active' },
      relations: ['group'],
      order: { joinedAt: 'DESC' },
    });
    return this.attachMemberCounts(memberships.map(m => m.group));
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    // A pending join request is NOT yet membership.
    const count = await this.memberRepo.count({
      where: { group: { id: groupId }, user: { id: userId }, status: 'active' },
    });
    return count > 0;
  }

  async getMemberCount(groupId: string): Promise<number> {
    return this.memberRepo.count({ where: { group: { id: groupId }, status: 'active' } });
  }

  async getMembers(groupId: string, page: number, limit: number) {
    const [data, total] = await this.memberRepo.findAndCount({
      where: { group: { id: groupId } },
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { joinedAt: 'DESC' },
    });
    return { data: data.map(m => ({ ...m.user, joinedAt: m.joinedAt })), total };
  }

  async delete(groupId: string) {
    await this.memberRepo.delete({ group: { id: groupId } as any });
    await this.groupsRepo.delete(groupId);
  }

  async banMember(groupId: string, memberUserId: string, adminUserId: string) {
    const adminMembership = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: adminUserId } },
    });
    if (!adminMembership || adminMembership.role !== 'admin') {
      throw new ConflictException('Only admins can ban members');
    }

    const member = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: memberUserId } },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === 'admin') throw new ConflictException('Cannot ban an admin');

    member.isBanned = true;
    await this.memberRepo.save(member);
    return member;
  }

  async unbanMember(groupId: string, memberUserId: string, adminUserId: string) {
    const adminMembership = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: adminUserId } },
    });
    if (!adminMembership || adminMembership.role !== 'admin') {
      throw new ConflictException('Only admins can unban members');
    }

    const member = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: memberUserId } },
    });
    if (!member) throw new NotFoundException('Member not found');

    member.isBanned = false;
    await this.memberRepo.save(member);
    return member;
  }

  async getMemberRole(groupId: string, userId: string): Promise<string> {
    const member = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: userId } },
    });
    return member?.role || 'none';
  }

  // Paginated list of groups by privacy ('public' | 'private'), optionally
  // filtered by category. The category param was previously dropped on the
  // floor, so the Groups page category filter did nothing (#37).
  async findByPrivacy(privacy: GroupPrivacy, page: number, limit: number, category?: string) {
    const where: any = { privacy };
    if (category && category.trim()) where.category = category.trim();
    const [data, total] = await this.groupsRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data: await this.attachMemberCounts(data), total };
  }

  // Public groups the user has not joined yet.
  async getSuggested(userId: string, limit: number) {
    const memberships = await this.memberRepo.find({
      where: { user: { id: userId } },
      relations: ['group'],
    });
    const joinedIds = memberships.map((m) => m.group.id);
    // Exclude joined groups at the DB level instead of over-fetching
    // (limit + joined.size) rows into memory and filtering — that was a
    // memory/DoS risk for users with very many memberships.
    const groups = await this.groupsRepo.find({
      where: joinedIds.length
        ? { privacy: 'public', id: Not(In(joinedIds)) }
        : { privacy: 'public' },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return this.attachMemberCounts(groups);
  }

  // Groups the user has requested to join (private groups) that are awaiting
  // admin approval. Powers the "pending requests" UI and the per-card
  // "قيد الانتظار" badge (#36).
  async getPendingRequests(userId: string) {
    const pending = await this.memberRepo.find({
      where: { user: { id: userId }, status: 'pending' },
      relations: ['group'],
      order: { joinedAt: 'DESC' },
    });
    return pending.map((m) => m.group);
  }
}
