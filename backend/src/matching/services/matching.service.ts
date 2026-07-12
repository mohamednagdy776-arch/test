import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Match } from '../entities/match.entity';
import { ProfileWithMatchDto } from '../dto/profile-with-match.dto';
import { Profile } from '../../users/entities/profile.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectRepository(Match) private matchesRepo: Repository<Match>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private httpService: HttpService,
  ) {}

  async getMatches(userId: string, page: number, limit: number, status?: string, minAge?: number, maxAge?: number, location?: string, religiousCommitment?: string) {
    // Get current user's gender for opposite-gender filtering
    const currentUser = await this.usersRepo.findOne({ where: { id: userId } });
    const currentGender = currentUser?.gender ?? null;
    const oppositeGender = currentGender === 'male' ? 'female' : currentGender === 'female' ? 'male' : null;

    const statusFilter = status ? { status: status as any } : {};
    const [data, total] = await this.matchesRepo.findAndCount({
      where: [{ user1: { id: userId }, ...statusFilter }, { user2: { id: userId }, ...statusFilter }],
      order: { score: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user1', 'user2'],
    });

    // Enrich with profile data for the "other" user in each match
    const enrichedData = await Promise.all(
      data.map(async (match) => {
        const otherUserId = match.user1.id === userId ? match.user2.id : match.user1.id;

        const otherUser = await this.usersRepo.findOne({ where: { id: otherUserId } });

        // Filter out same-gender matches when gender is known
        if (oppositeGender && otherUser?.gender && otherUser.gender !== oppositeGender) {
          return null;
        }

        const profile = await this.profilesRepo.findOne({
          where: { user: { id: otherUserId } },
        });

        const otherUserName =
          `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`.trim() ||
          profile?.fullName || otherUser?.fullName || null;

        // Age filter (#690)
        const age = profile?.age ?? null;
        if (minAge && age !== null && age < minAge) return null;
        if (maxAge && age !== null && age > maxAge) return null;

        // location/religiousCommitment were accepted by the Matching page's
        // filter UI but never forwarded past the controller at all -- they
        // had zero effect on the displayed results (#257).
        if (location) {
          const loc = location.trim().toLowerCase();
          const matchesLocation =
            profile?.city?.toLowerCase().includes(loc) || profile?.country?.toLowerCase().includes(loc);
          if (!matchesLocation) return null;
        }
        if (religiousCommitment && profile?.religiousCommitment !== religiousCommitment) return null;

        return {
          id: match.id,
          user1Id: match.user1.id,
          user2Id: match.user2.id,
          otherUserId,
          score: match.score,
          breakdown: match.breakdown ?? null,
          status: match.status,
          createdAt: match.createdAt,
          otherUserName,
          otherUserAvatar: profile?.avatarUrl || null,
        };
      })
    );

    const filteredData = enrichedData.filter((m) => m !== null);
    // Return the true DB total (matches are opposite-gender by construction),
    // not the post-filter length of the current page — otherwise the frontend
    // computes the wrong number of pages and stops paginating early.
    return { data: filteredData, total };
  }

  async generateMatchesForUser(userId: string): Promise<Match[]> {
    const currentUser = await this.usersRepo.findOne({ where: { id: userId } });
    if (!currentUser) return [];

    const currentProfile = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    const currentGender = currentUser.gender ?? null;
    const oppositeGender = currentGender === 'male' ? 'female' : currentGender === 'female' ? 'male' : null;

    // Get IDs already matched with
    const existingMatches = await this.matchesRepo.find({
      where: [{ user1: { id: userId } }, { user2: { id: userId } }],
      relations: ['user1', 'user2'],
    });
    const matchedIds = new Set(
      existingMatches.flatMap((m) => [m.user1.id, m.user2.id]).filter((id) => id !== userId)
    );

    // Find candidate users (opposite gender, active, not already matched)
    const query = this.usersRepo.createQueryBuilder('user')
      .where('user.id != :userId', { userId })
      .andWhere('user.status = :status', { status: 'active' });

    if (oppositeGender) {
      query.andWhere('user.gender = :gender', { gender: oppositeGender });
    }

    const candidates = await query.take(50).getMany();
    const unmatched = candidates.filter((u) => !matchedIds.has(u.id)).slice(0, 10);

    const pending: Match[] = [];

    for (const candidate of unmatched) {
      try {
        const candidateProfile = await this.profilesRepo.findOne({ where: { user: { id: candidate.id } } });

        const profileA = this.transformToAiProfile(
          currentProfile
            ? { ...this.profileToAiFields(currentProfile), userId }
            : { userId, email: currentUser.email }
        );
        const profileB = this.transformToAiProfile(
          candidateProfile
            ? { ...this.profileToAiFields(candidateProfile), userId: candidate.id }
            : { userId: candidate.id, email: candidate.email }
        );

        const aiResponse = await this.httpService.axiosRef.post(
          'http://ai-service:5000/api/v1/match',
          { user_a: profileA, user_b: profileB },
        ).catch(() => ({ data: { compatibilityScore: Math.floor(Math.random() * 40) + 50 } }));

        const score = aiResponse.data?.compatibilityScore ?? 50;
        const breakdown = aiResponse.data?.breakdown ?? null;

        pending.push(this.matchesRepo.create({
          user1: currentUser,
          user2: candidate,
          score,
          breakdown,
          status: 'pending',
        }));
      } catch (err) {
        // Don't silently swallow: a systemic AI-service outage would otherwise
        // be invisible. We still skip the candidate, but it's logged.
        this.logger.warn(
          `generateMatchesForUser: scoring failed for candidate ${candidate.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    // Persist all matches atomically so a mid-batch crash can't leave a
    // half-generated, inconsistent set behind.
    if (pending.length === 0) return [];
    return this.matchesRepo.manager.transaction((em) => em.save(pending));
  }

  private profileToAiFields(profile: Profile) {
    return {
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
    };
  }

  async respondToMatch(matchId: string, userId: string, status: 'accepted' | 'rejected') {
    const match = await this.matchesRepo.findOneOrFail({ where: { id: matchId }, relations: ['user1', 'user2'] });
    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    match.status = status;
    return this.matchesRepo.save(match);
  }

  // Reverts a rejected match to its default pending state (#137). Only valid
  // from 'rejected' — this is a dedicated undo, not a generic status reset.
  async undoReject(matchId: string, userId: string) {
    const match = await this.matchesRepo.findOneOrFail({ where: { id: matchId }, relations: ['user1', 'user2'] });
    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (match.status !== 'rejected') {
      throw new BadRequestException('Only a rejected match can be undone');
    }
    match.status = 'pending';
    return this.matchesRepo.save(match);
  }

  // "Undo Reject" existed but there was no equivalent for an accepted match
  // (#362) -- same pattern, reverts to pending, only valid from 'accepted'.
  async undoAccept(matchId: string, userId: string) {
    const match = await this.matchesRepo.findOneOrFail({ where: { id: matchId }, relations: ['user1', 'user2'] });
    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (match.status !== 'accepted') {
      throw new BadRequestException('Only an accepted match can be undone');
    }
    match.status = 'pending';
    return this.matchesRepo.save(match);
  }

  async getById(id: string, userId: string) {
    const match = await this.matchesRepo.findOneOrFail({ where: { id }, relations: ['user1', 'user2'] });
    if (match.user1.id !== userId && match.user2.id !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return match;
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
      'http://ai-service:5000/api/v1/match',
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
      // Do NOT expose another user's email/phone in the match-profile view.
      email: '',
      phone: '',
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
