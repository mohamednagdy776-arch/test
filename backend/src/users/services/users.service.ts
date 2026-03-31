import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { SearchUsersDto } from '../dto/search-users.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async getProfile(userId: string) {
    return this.profilesRepo.findOne({ where: { user: { id: userId } } }) ?? null;
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
      gender: dto.gender ?? 'male',
      country: dto.country ?? '',
      city: dto.city ?? '',
    });
    return this.profilesRepo.save(profile);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.createProfile(userId, dto);
  }

  // Search users by profile fields
  async searchUsers(dto: SearchUsersDto) {
    const { name, gender, country, city, sect, lifestyle, education, prayerLevel, minAge, maxAge, page = 1, limit = 20 } = dto;

    const qb = this.profilesRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .where('u.status = :status', { status: 'active' });

    if (name) qb.andWhere('p.fullName ILIKE :name', { name: `%${name}%` });
    if (gender) qb.andWhere('p.gender = :gender', { gender });
    if (country) qb.andWhere('p.country ILIKE :country', { country: `%${country}%` });
    if (city) qb.andWhere('p.city ILIKE :city', { city: `%${city}%` });
    if (sect) qb.andWhere('p.sect = :sect', { sect });
    if (lifestyle) qb.andWhere('p.lifestyle = :lifestyle', { lifestyle });
    if (education) qb.andWhere('p.education = :education', { education });
    if (prayerLevel) qb.andWhere('p.prayerLevel = :prayerLevel', { prayerLevel });
    if (minAge) qb.andWhere('p.age >= :minAge', { minAge });
    if (maxAge) qb.andWhere('p.age <= :maxAge', { maxAge });

    const [profiles, total] = await qb
      .orderBy('p.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: profiles.map((p) => ({
        userId: p.user?.id,
        fullName: p.fullName,
        age: p.age,
        gender: p.gender,
        country: p.country,
        city: p.city,
        education: p.education,
        jobTitle: p.jobTitle,
        lifestyle: p.lifestyle,
        sect: p.sect,
        prayerLevel: p.prayerLevel,
        bio: p.bio,
        avatarUrl: p.avatarUrl,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get public profile of any user
  async getPublicProfile(userId: string) {
    const profile = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) return null;
    return {
      userId,
      fullName: profile.fullName,
      age: profile.age,
      gender: profile.gender,
      country: profile.country,
      city: profile.city,
      education: profile.education,
      jobTitle: profile.jobTitle,
      lifestyle: profile.lifestyle,
      sect: profile.sect,
      prayerLevel: profile.prayerLevel,
      religiousCommitment: profile.religiousCommitment,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
    };
  }

  // Admin: list all users
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

  async ban(userId: string) {
    await this.usersRepo.update(userId, { status: 'banned' });
    return this.usersRepo.findOneOrFail({ where: { id: userId } });
  }

  async unban(userId: string) {
    await this.usersRepo.update(userId, { status: 'active' });
    return this.usersRepo.findOneOrFail({ where: { id: userId } });
  }
}
