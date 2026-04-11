import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { ProfileWork } from '../entities/profile-work.entity';
import { ProfileEducation } from '../entities/profile-education.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { User } from '../../auth/entities/user.entity';
import { UpdateProfileWithEntriesDto } from '../dto/update-profile.dto';
import { SearchUsersDto } from '../dto/search-users.dto';
import { ActivityLogQueryDto } from '../dto/activity-log.dto';
import { FriendsService } from '../../friends/services/friends.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(ProfileWork) private workRepo: Repository<ProfileWork>,
    @InjectRepository(ProfileEducation) private eduRepo: Repository<ProfileEducation>,
    @InjectRepository(ActivityLog) private activityRepo: Repository<ActivityLog>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private friendsService: FriendsService,
  ) {}

  async getProfile(userId: string) {
    let profile = await this.profilesRepo.findOne({
      where: { user: { id: userId } },
      relations: ['workEntries', 'educationEntries'],
    });
    if (!profile) {
      profile = await this.profilesRepo
        .createQueryBuilder('p')
        .where('p.user_id = :userId', { userId })
        .leftJoinAndSelect('p.workEntries', 'work')
        .leftJoinAndSelect('p.educationEntries', 'education')
        .getOne();
    }
    if (!profile) return null;
    return this.formatProfile(profile, userId);
  }

  async createProfile(userId: string, dto: UpdateProfileWithEntriesDto) {
    let profile = await this.profilesRepo.findOne({
      where: { user: { id: userId } },
      relations: ['workEntries', 'educationEntries'],
    });

    if (profile) {
      Object.assign(profile, dto);
      if (dto.workEntries) {
        await this.workRepo.delete({ profile: { id: profile.id } });
        profile.workEntries = dto.workEntries.map(w => {
          const work = new ProfileWork();
          Object.assign(work, w);
          work.profile = profile!;
          return work;
        });
      }
      if (dto.educationEntries) {
        await this.eduRepo.delete({ profile: { id: profile.id } });
        profile.educationEntries = dto.educationEntries.map(e => {
          const edu = new ProfileEducation();
          Object.assign(edu, e);
          edu.profile = profile!;
          return edu;
        });
      }
      return this.profilesRepo.save(profile);
    }

    profile = this.profilesRepo.create({
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

  async updateProfile(userId: string, dto: UpdateProfileWithEntriesDto) {
    return this.createProfile(userId, dto);
  }

  async getFullProfile(userId: string, viewerId?: string) {
    let profile = await this.profilesRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'workEntries', 'educationEntries'],
    });
    if (!profile) {
      profile = await this.profilesRepo
        .createQueryBuilder('p')
        .where('p.user_id = :userId', { userId })
        .leftJoinAndSelect('p.user', 'user')
        .leftJoinAndSelect('p.workEntries', 'work')
        .leftJoinAndSelect('p.educationEntries', 'education')
        .getOne();
    }
    if (!profile) return null;

    const isSelf = viewerId === userId;
    const mutualFriends = isSelf ? 0 : await this.getMutualFriendsCount(userId, viewerId ?? '');

    return {
      ...this.formatProfile(profile, userId),
      username: profile.user?.username || profile.user?.email?.split('@')[0],
      joinDate: profile.createdAt,
      mutualFriends,
      isSelf,
    };
  }

  private async getMutualFriendsCount(userId: string, viewerId: string): Promise<number> {
    const userFriends = await this.friendsService.getFriends(userId, 1, 1000);
    const viewerFriends = await this.friendsService.getFriends(viewerId, 1, 1000);
    
    const userFriendIds = new Set(userFriends.data.map(f => f.id));
    const mutualCount = viewerFriends.data.filter(f => userFriendIds.has(f.id)).length;
    
    return mutualCount;
  }

  private formatProfile(profile: Profile, userId?: string) {
    return {
      id: profile.id,
      userId: profile.user?.id,
      fullName: profile.fullName,
      age: profile.age,
      gender: profile.gender,
      country: profile.country,
      city: profile.city,
      socialStatus: profile.socialStatus,
      childrenCount: profile.childrenCount,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      coverUrl: profile.coverUrl,
      website: profile.website,
      relationshipStatus: profile.relationshipStatus,
      location: profile.location,
      workplace: profile.workplace,
      introVisibility: profile.introVisibility,
      workEntries: profile.workEntries,
      educationEntries: profile.educationEntries,
      education: profile.education,
      jobTitle: profile.jobTitle,
      lifestyle: profile.lifestyle,
      sect: profile.sect,
      prayerLevel: profile.prayerLevel,
      religiousCommitment: profile.religiousCommitment,
      createdAt: profile.createdAt,
    };
  }

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

  async getPublicProfile(userId: string) {
    let profile = await this.profilesRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'workEntries', 'educationEntries'],
    });
    if (!profile) {
      profile = await this.profilesRepo
        .createQueryBuilder('p')
        .where('p.user_id = :userId', { userId })
        .leftJoinAndSelect('p.user', 'user')
        .leftJoinAndSelect('p.workEntries', 'work')
        .leftJoinAndSelect('p.educationEntries', 'education')
        .getOne();
    }
    if (!profile) return null;
    return this.formatProfile(profile, userId);
  }

  async updateCover(userId: string, coverUrl: string) {
    await this.profilesRepo.update({ user: { id: userId } }, { coverUrl });
    await this.logActivity(userId, 'photo', 'Updated cover photo', { coverUrl });
    return this.getProfile(userId);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    await this.profilesRepo.update({ user: { id: userId } }, { avatarUrl });
    await this.logActivity(userId, 'photo', 'Updated profile picture', { avatarUrl });
    return this.getProfile(userId);
  }

  async getActivityLog(userId: string, dto: ActivityLogQueryDto) {
    const { page = 1, limit = 20, year, type } = dto;

    const qb = this.activityRepo.createQueryBuilder('a')
      .where('a.userId = :userId', { userId })
      .andWhere('a.isHidden = :isHidden', { isHidden: false });

    if (year) qb.andWhere('EXTRACT(YEAR FROM a.createdAt) = :year', { year: parseInt(year) });
    if (type) qb.andWhere('a.type = :type', { type });

    const [activities, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: activities, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getFriends(userId: string, page = 1, limit = 20) {
    return this.friendsService.getFriends(userId, page, limit);
  }

  async getPhotos(userId: string, page = 1, limit = 20) {
    const activities = await this.activityRepo.find({
      where: { userId, type: 'photo' as any },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: activities, total: 0, page, totalPages: 0 };
  }

  async getVideos(userId: string, page = 1, limit = 20) {
    const activities = await this.activityRepo.find({
      where: { userId, type: 'video' as any },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: activities, total: 0, page, totalPages: 0 };
  }

  async logActivity(userId: string, type: string, description: string, metadata?: Record<string, any>) {
    const activity = this.activityRepo.create({
      userId,
      type: type as any,
      description,
      metadata,
    });
    await this.activityRepo.save(activity);
  }

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
