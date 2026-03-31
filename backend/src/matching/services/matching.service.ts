import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Match } from '../entities/match.entity';
import { ProfileWithMatchDto } from '../dto/profile-with-match.dto';
import { Profile } from '../../users/entities/profile.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Match) private matchesRepo: Repository<Match>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private httpService: HttpService,
  ) {}

  async getMatches(userId: string, page: number, limit: number) {
    const [data, total] = await this.matchesRepo.findAndCount({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      order: { score: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async respondToMatch(matchId: string, userId: string, status: 'accepted' | 'rejected') {
    const match = await this.matchesRepo.findOneOrFail({ where: { id: matchId } });
    match.status = status;
    return this.matchesRepo.save(match);
  }

  async getById(id: string) {
    return this.matchesRepo.findOneOrFail({ where: { id } });
  }

  /**
   * Get a user's profile along with the match compatibility score
   * between the current user and the target user.
   */
  async getProfileWithMatchScore(currentUserId: string, targetUserId: string): Promise<ProfileWithMatchDto> {
    const [currentProfile, targetProfile] = await Promise.all([
      this.getPublicProfile(currentUserId),
      this.getPublicProfile(targetUserId),
    ]);

    if (!currentProfile) {
      throw new NotFoundException('Current user profile not found');
    }

    if (!targetProfile) {
      throw new NotFoundException('Target user profile not found');
    }

    // Transform to AI service format
    const profileA = this.transformToAiProfile(currentProfile);
    const profileB = this.transformToAiProfile(targetProfile);

    // Call AI service for match score
    const aiResponse = await this.httpService.axiosRef.post(
      'http://ai-service:8000/api/v1/match',
      { user_a: profileA, user_b: profileB },
    );

    const { compatibilityScore, matchReasons } = aiResponse.data;

    // Build response DTO - transform to match frontend expected format
    const response: ProfileWithMatchDto = {
      user: this.transformToUserProfile(targetProfile),
      matchScore: compatibilityScore,
      matchReasons: matchReasons || [],
    };

    return response;
  }

  /**
   * Get public profile for a user
   */
  private async getPublicProfile(userId: string) {
    const [profile, user] = await Promise.all([
      this.profilesRepo.findOne({ where: { user: { id: userId } } }),
      this.usersRepo.findOne({ where: { id: userId } }),
    ]);
    if (!profile) return null;

    return {
      userId,
      email: user?.email || '',
      phone: user?.phone || '',
      status: user?.status || 'active',
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
      maritalStatus: profile.socialStatus,
      childrenCount: profile.childrenCount,
      culturalLevel: profile.culturalLevel,
      wantsChildren: profile.wantsChildren,
      relocateWilling: profile.relocateWilling,
      preferredCountry: profile.preferredCountry,
      createdAt: profile.createdAt,
    };
  }

  /**
   * Transform public profile to AI service UserProfile format
   */
  private transformToAiProfile(profile: any) {
    return {
      user_id: profile.userId,
      sect: profile.sect || null,
      prayer_level: this.parsePrayerLevel(profile.prayerLevel),
      quran_memorization: null, // Not available in profile, default to null
      religious_commitment: this.parseReligiousCommitment(profile.religiousCommitment),
      cultural_level: this.parseCulturalLevel(profile.culturalLevel),
      lifestyle_type: profile.lifestyle || null,
      future_goals: null, // Not available in profile, default to null
      interests: [], // Not available in profile, default to empty array
      age: profile.age || null,
      marital_status: profile.maritalStatus || null,
      children_count: profile.childrenCount ?? 0,
      education_level: this.parseEducationLevel(profile.education),
      country: profile.country || null,
      city: profile.city || null,
      wants_children: profile.wantsChildren ?? null,
      willing_to_relocate: profile.relocateWilling ?? null,
      preferred_country: profile.preferredCountry || null,
    };
  }

  private parsePrayerLevel(value: string | null | undefined): number | null {
    if (!value) return null;
    const levelMap: Record<string, number> = {
      'never': 0, 'rarely': 1, 'sometimes': 2, 'often': 3, 'daily': 4, 'always': 5,
    };
    return levelMap[value.toLowerCase()] ?? null;
  }

  private parseReligiousCommitment(value: string | null | undefined): number | null {
    if (!value) return null;
    const levelMap: Record<string, number> = {
      'low': 1, 'moderate': 3, 'high': 5,
    };
    return levelMap[value.toLowerCase()] ?? null;
  }

  private parseCulturalLevel(value: string | null | undefined): number | null {
    if (!value) return null;
    const levelMap: Record<string, number> = {
      'conservative': 1, 'traditional': 2, 'moderate': 3, 'open': 4, 'liberal': 5,
    };
    return levelMap[value.toLowerCase()] ?? null;
  }

  private parseEducationLevel(value: string | null | undefined): number | null {
    if (!value) return null;
    const levelMap: Record<string, number> = {
      'high school': 1, 'some college': 2, "bachelor's": 3, "master's": 4, 'phd': 5,
    };
    return levelMap[value.toLowerCase()] ?? null;
  }

  /**
   * Transform profile to UserProfile format expected by frontend
   */
  private transformToUserProfile(profile: any) {
    // Split fullName into firstName and lastName
    const nameParts = (profile.fullName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      id: profile.userId,
      email: profile.email || '',
      phone: profile.phone || '',
      accountType: 'user' as const,
      status: profile.status || 'active',
      createdAt: profile.createdAt ? new Date(profile.createdAt).toISOString() : new Date().toISOString(),
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      gender: profile.gender || undefined,
      age: profile.age || undefined,
      country: profile.country || undefined,
      city: profile.city || undefined,
      sect: profile.sect || undefined,
      lifestyle: profile.lifestyle || undefined,
      education: profile.education || undefined,
      occupation: profile.jobTitle || undefined,
      bio: profile.bio || undefined,
      avatar: profile.avatarUrl || undefined,
      prayerLevel: profile.prayerLevel || undefined,
    };
  }
}
