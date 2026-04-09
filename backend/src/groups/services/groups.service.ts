import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Group } from '../entities/group.entity';
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

  async findAll(page: number, limit: number) {
    const [data, total] = await this.groupsRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async search(query: string, userId: string) {
    if (!query || query.trim().length === 0) {
      return { joinedGroups: [], otherGroups: [] };
    }

    const searchTerm = `%${query.trim()}%`;

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

    return { joinedGroups, otherGroups };
  }

  async autocomplete(query: string) {
    if (!query || query.trim().length === 0) return [];

    return this.groupsRepo
      .createQueryBuilder('group')
      .where('group.name ILIKE :search', { search: `%${query.trim()}%` })
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

    const existing = await this.memberRepo.findOne({
      where: { group: { id: groupId }, user: { id: user.id } },
    });
    if (existing) throw new ConflictException('Already a member');

    await this.memberRepo.save(this.memberRepo.create({
      group: { id: groupId } as any,
      user,
    }));
    return group;
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
      where: { user: { id: userId } },
      relations: ['group'],
      order: { joinedAt: 'DESC' },
    });
    return memberships.map(m => m.group);
  }

  async isMember(groupId: string, userId: string): Promise<boolean> {
    const count = await this.memberRepo.count({
      where: { group: { id: groupId }, user: { id: userId } },
    });
    return count > 0;
  }

  async getMemberCount(groupId: string): Promise<number> {
    return this.memberRepo.count({ where: { group: { id: groupId } } });
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
}
