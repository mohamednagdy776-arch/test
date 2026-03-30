import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.getProfile(userId);
    Object.assign(profile, dto);
    return this.profilesRepo.save(profile);
  }
}
