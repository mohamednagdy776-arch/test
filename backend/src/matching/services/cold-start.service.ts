import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class ColdStartService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async getCompletenessScore(userId: string): Promise<{ score: number; sections: Record<string, boolean> }> {
    const user = await this.usersRepo.findOne({ where: { id: userId }, relations: ['profile'] });
    const sections = {
      basicInfo: !!(user?.firstName && user?.dateOfBirth && user?.gender),
      contact: !!(user?.email && user?.phone),
      profile: !!(user?.profile?.bio),
      preferences: !!(user?.profile?.minAge || user?.profile?.maxAge || user?.profile?.preferredCountry),
    };
    const completed = Object.values(sections).filter(Boolean).length;
    const score = Math.round((completed / Object.keys(sections).length) * 100);
    return { score, sections };
  }

  async isInColdStart(userId: string): Promise<boolean> {
    const { score } = await this.getCompletenessScore(userId);
    return score < 40;
  }
}
