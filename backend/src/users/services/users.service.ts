import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    // Return profile if exists, otherwise return null (user can create it)
    const profile = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    return profile ?? null;
  }

  async createProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    if (existing) {
      Object.assign(existing, dto);
      return this.profilesRepo.save(existing);
    }
    const profile = this.profilesRepo.create({
      ...dto,
      user: { id: userId } as any,
      fullName: dto.fullName ?? '',
      age: dto.age ?? 18,
      gender: 'male',
      country: dto.country ?? '',
      city: dto.city ?? '',
    });
    return this.profilesRepo.save(profile);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.createProfile(userId, dto);
  }

  // Admin: list all users with pagination
  async findAll(page: number, limit: number) {
    const [data, total] = await this.usersRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'email', 'phone', 'accountType', 'status', 'createdAt'],
    });
    return { data, total };
  }

  async findOne(id: string) {
    return this.usersRepo.findOneOrFail({
      where: { id },
      select: ['id', 'email', 'phone', 'accountType', 'status', 'createdAt'],
    });
  }

  // Admin: ban a user
  async ban(userId: string) {
    await this.usersRepo.update(userId, { status: 'banned' });
    return this.usersRepo.findOneOrFail({ where: { id: userId } });
  }

  // Admin: unban a user
  async unban(userId: string) {
    await this.usersRepo.update(userId, { status: 'active' });
    return this.usersRepo.findOneOrFail({ where: { id: userId } });
  }
}
