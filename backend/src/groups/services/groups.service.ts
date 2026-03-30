import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groupsRepo: Repository<Group>,
  ) {}

  async create(dto: CreateGroupDto, user: User) {
    const group = this.groupsRepo.create({ ...dto, createdBy: user });
    return this.groupsRepo.save(group);
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.groupsRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async delete(groupId: string) {
    await this.groupsRepo.delete(groupId);
  }
}
