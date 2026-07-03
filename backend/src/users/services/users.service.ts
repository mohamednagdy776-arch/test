import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Profile } from '../entities/profile.entity';
import { ProfileWork } from '../entities/profile-work.entity';
import { ProfileEducation } from '../entities/profile-education.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { User } from '../../auth/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Reaction } from '../../reactions/entities/reaction.entity';
import { Friendship, FriendshipStatus } from '../../friends/entities/friendship.entity';
import { UpdateProfileWithEntriesDto } from '../dto/update-profile.dto';
import { SearchUsersDto } from '../dto/search-users.dto';
import { ActivityLogQueryDto } from '../dto/activity-log.dto';
import { FriendsService } from '../../friends/services/friends.service';
import { PhotoPrivacyService } from '../../photo-privacy/photo-privacy.service';
import { SettingsService } from '../../settings/services/settings.service';
import { signMediaPath } from '../../common/utils/media-token';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
    @InjectRepository(ProfileWork) private workRepo: Repository<ProfileWork>,
    @InjectRepository(ProfileEducation) private eduRepo: Repository<ProfileEducation>,
    @InjectRepository(ActivityLog) private activityRepo: Repository<ActivityLog>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private friendsService: FriendsService,
    private photoPrivacyService: PhotoPrivacyService,
    private settingsService: SettingsService,
    private dataSource: DataSource,
  ) {}

  // A user's own posts (the profile "posts" tab). Accepts a UUID or username.
  async getUserPosts(idOrUsername: string, page: number, limit: number, viewerId?: string) {
    const userId = await this.resolveUserId(idOrUsername);
    if (!userId) return { data: [] as Post[], total: 0 };
    // resolveUserId's UUID branch returns the id as-is without checking the DB
    // at all, so a deleted/deactivated account's posts kept showing here even
    // though the deletion flow promises content is gone (#149).
    const author = await this.usersRepo.findOne({ where: { id: userId } });
    if (!author || author.isDeactivated) return { data: [] as Post[], total: 0 };

    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.group', 'group')
      // The feed queries (posts.service.ts) also join originalPost so a
      // shared post can render its source; this query never did, so shared
      // posts rendered broken/empty on the profile Posts tab only (#98).
      .leftJoinAndSelect('post.originalPost', 'originalPost')
      .leftJoinAndSelect('originalPost.user', 'originalPostUser')
      .where('post.user_id = :userId', { userId })
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    // The audience of each post is set from the author's "who can see my
    // posts" privacy setting at creation time (posts.service.ts createPost).
    // This endpoint never checked it at all — posts stayed visible to every
    // viewer regardless of the Private setting (#103). Mirror the same
    // audience+friendship check `PostsService.applyAudienceFilter` uses for
    // the main feed so the profile "Posts" tab is consistent with it.
    if (viewerId && viewerId !== userId) {
      qb.andWhere(`(
        post.audience = 'public'
        OR (
          post.audience IN ('friends', 'friends_of_friends')
          AND EXISTS (
            SELECT 1 FROM friendships f
            WHERE f.status = 'accepted'
            AND f.deleted_at IS NULL
            AND (
              (f.requester_id = post.user_id AND f.addressee_id = :viewerId)
              OR (f.addressee_id = post.user_id AND f.requester_id = :viewerId)
            )
          )
        )
      )`, { viewerId });
    } else if (!viewerId) {
      qb.andWhere("post.audience = 'public'");
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async getProfile(userId: string) {
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
    if (!profile) {
      // No profile row yet (e.g. just registered) — synthesize a name from the user.
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (!user) return null;
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.fullName || '';
      return {
        id: null,
        userId: user.id,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        username: user.username ?? null,
        fullName: name,
        gender: user.gender ?? null,
      } as any;
    }
    return this.formatProfile(profile, userId);
  }

  async createProfile(userId: string, dto: UpdateProfileWithEntriesDto) {
    // Run the delete-then-save of work/education entries atomically. Without a
    // transaction, a failure after the deletes wipes the user's history with no
    // rollback (data loss).
    return this.dataSource.transaction(async (manager) => {
      let profile = await manager.findOne(Profile, {
        where: { user: { id: userId } },
        relations: ['workEntries', 'educationEntries'],
      });

      if (profile) {
        Object.assign(profile, dto);
        if (dto.workEntries) {
          await manager.delete(ProfileWork, { profile: { id: profile.id } });
          profile.workEntries = dto.workEntries.map(w => {
            const work = new ProfileWork();
            Object.assign(work, w);
            work.profile = profile!;
            return work;
          });
        }
        if (dto.educationEntries) {
          await manager.delete(ProfileEducation, { profile: { id: profile.id } });
          profile.educationEntries = dto.educationEntries.map(e => {
            const edu = new ProfileEducation();
            Object.assign(edu, e);
            edu.profile = profile!;
            return edu;
          });
        }
        return manager.save(Profile, profile);
      }

      profile = manager.create(Profile, {
        ...dto,
        user: { id: userId } as any,
        fullName: dto.fullName ?? '',
        age: dto.age ?? 18,
        // Don't silently default an omitted gender to 'male' (#192) — leave it
        // unset so the user is prompted rather than mis-gendered.
        gender: dto.gender ?? null,
        country: dto.country ?? '',
        city: dto.city ?? '',
      });
      return manager.save(Profile, profile);
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileWithEntriesDto) {
    return this.createProfile(userId, dto);
  }

  // Accepts either a user UUID or a username. The web app links to profiles by
  // username (/[username] → GET /users/{username}); a raw username hitting a
  // UUID column otherwise throws "invalid input syntax for type uuid" → 400.
  async resolveUserId(idOrUsername: string): Promise<string | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);
    if (isUuid) return idOrUsername;
    const user = await this.usersRepo.findOne({ where: { username: idOrUsername } });
    return user?.id ?? null;
  }

  async getFullProfile(idOrUsername: string, viewerId?: string) {
    const userId = await this.resolveUserId(idOrUsername);
    if (!userId) return null;
    // Block enforcement (#758): if either party has blocked the other, the
    // profile is not viewable. Returning null makes the controller 404 it,
    // hiding both the profile and the fact that a block exists.
    if (viewerId && await this.friendsService.isBlockedEither(viewerId, userId)) {
      return null;
    }
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
    if (!profile) {
      // The user EXISTS (resolveUserId matched) but has no profile row yet — e.g.
      // registered/onboarded but never edited their profile. Returning null here
      // 404s a real person, so a post author with no profile shows "User not
      // found" (#13). Synthesize a minimal profile from the user so their page
      // loads. (A truly nonexistent user already short-circuited to null above.)
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (!user) return null;
      const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.fullName || '';
      const { total: friendCount } = await this.friendsService.getFriends(userId, 1, 1);
      return {
        id: null,
        userId: user.id,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        username: user.username ?? null,
        fullName: name,
        gender: user.gender ?? null,
        avatarUrl: null,
        coverUrl: null,
        joinDate: user.createdAt,
        createdAt: user.createdAt,
        photoVisibility: 'public',
        photoLocked: false,
        mutualFriends: 0,
        friendCount,
        isSelf: viewerId === userId,
      } as any;
    }

    const isSelf = viewerId === userId;
    const mutualFriends = isSelf ? 0 : await this.getMutualFriendsCount(userId, viewerId ?? '');
    const { total: friendCount } = await this.friendsService.getFriends(userId, 1, 1);

    const formatted = this.formatProfile(profile, userId);
    // Photo privacy (#752): if the viewer isn't allowed to see this user's photos,
    // strip the avatar/cover and flag it so the client can blur + offer "request".
    const visibility = (profile.photoVisibility as any) ?? 'public';
    const photoLocked = !isSelf && !(await this.photoPrivacyService.canViewPhoto(viewerId, userId, visibility));
    if (photoLocked) {
      (formatted as any).avatarUrl = null;
      (formatted as any).coverUrl = null;
    }

    return {
      ...formatted,
      username: profile.user?.username ?? null,
      joinDate: profile.createdAt,
      photoVisibility: visibility,
      photoLocked,
      mutualFriends,
      friendCount,
      isSelf,
    };
  }

  private async getMutualFriendsCount(userId: string, viewerId: string): Promise<number> {
    if (!viewerId || viewerId === userId) return 0;
    // Compare full, uncapped id lists (no 1,000-friend truncation — #165).
    const [userFriendIds, viewerFriendIds] = await Promise.all([
      this.friendsService.getFriendIds(userId),
      this.friendsService.getFriendIds(viewerId),
    ]);
    const userSet = new Set(userFriendIds);
    return viewerFriendIds.filter((id) => userSet.has(id)).length;
  }

  // Normalise a stored avatar/cover value to a servable, token-signed media URL.
  // Legacy rows stored `/uploads/<type>/<file>` (404 — the only media route is
  // the token-protected GET /api/v1/media/:type/:file). Newer uploads already
  // store the full tokenized URL. (#833)
  private toMediaUrl(stored?: string | null): string | null {
    if (!stored) return null;
    if (/^https?:\/\//i.test(stored)) return stored; // external/CDN
    if (stored.startsWith('/api/v1/media/')) return stored; // already tokenized
    const path = stored.replace(/^\/?uploads\//, '').replace(/^\/+/, ''); // -> "avatars/<file>"
    if (!path) return null;
    return `/api/v1/media/${path}?t=${signMediaPath(path)}`;
  }

  private formatProfile(profile: Profile, userId?: string) {
    const u = profile.user;
    const nameFromUser = `${u?.firstName ?? ''} ${u?.lastName ?? ''}`.trim();
    // Prefer an explicitly edited profile name; otherwise use first + last name.
    const displayName = (profile.fullName && profile.fullName.trim())
      || nameFromUser || u?.fullName || '';
    return {
      id: profile.id,
      userId: profile.user?.id,
      firstName: u?.firstName ?? null,
      lastName: u?.lastName ?? null,
      username: u?.username ?? null,
      fullName: displayName,
      age: profile.age,
      gender: profile.gender,
      country: profile.country,
      city: profile.city,
      socialStatus: profile.socialStatus,
      childrenCount: profile.childrenCount,
      bio: profile.bio,
      avatarUrl: this.toMediaUrl(profile.avatarUrl),
      coverUrl: this.toMediaUrl(profile.coverUrl),
      website: profile.website,
      relationshipStatus: profile.relationshipStatus,
      location: profile.location,
      workplace: profile.workplace,
      introVisibility: profile.introVisibility,
      workEntries: profile.workEntries,
      educationEntries: profile.educationEntries,
      education: profile.education,
      jobTitle: profile.jobTitle,
      // Education & Work details — these were persisted but never returned, so
      // the edit form re-loaded them blank and the values looked "not saved" (#45).
      financialLevel: profile.financialLevel,
      culturalLevel: profile.culturalLevel,
      lifestyle: profile.lifestyle,
      sect: profile.sect,
      prayerLevel: profile.prayerLevel,
      religiousCommitment: profile.religiousCommitment,
      // Marriage preferences — same read-path omission as above (#46).
      minAge: profile.minAge,
      maxAge: profile.maxAge,
      preferredCountry: profile.preferredCountry,
      relocateWilling: profile.relocateWilling,
      wantsChildren: profile.wantsChildren,
      isHealthVerified: profile.isHealthVerified ?? false,
      isIdentityVerified: profile.isIdentityVerified ?? false,
      photoVisibility: profile.photoVisibility ?? 'public',
      incognito: profile.incognito ?? false,
      createdAt: profile.createdAt,
    };
  }

  async searchUsers(dto: SearchUsersDto, viewerId?: string) {
    const { name, gender, country, city, sect, lifestyle, education, prayerLevel, minAge, maxAge, page = 1, limit = 20 } = dto;

    const qb = this.profilesRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'u')
      .where('u.status = :status', { status: 'active' });

    if (viewerId) {
      qb.andWhere(`u.id NOT IN (
        SELECT blocked_id FROM blocks WHERE blocker_id = :viewerId
        UNION
        SELECT blocker_id FROM blocks WHERE blocked_id = :viewerId
      )`, { viewerId });
    }

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

  async getPublicProfile(idOrUsername: string) {
    const userId = await this.resolveUserId(idOrUsername);
    if (!userId) return null;
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

  // Return the user's profile row, creating an empty one (column defaults) if it
  // doesn't exist yet. Avatar/cover uploads used profilesRepo.update({ user }),
  // which silently affects 0 rows for a user who onboarded but never edited their
  // profile — so the image was written to disk but never persisted (#7). Upserting
  // the row first guarantees the subsequent update actually sticks.
  private async ensureProfile(userId: string): Promise<Profile> {
    const existing = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    if (existing) return existing;
    return this.profilesRepo.save(this.profilesRepo.create({ user: { id: userId } as any }));
  }

  async updateCover(userId: string, coverUrl: string) {
    const existing = await this.ensureProfile(userId);
    if (existing.coverUrl && existing.coverUrl !== coverUrl) {
      await this.deleteUploadedFile(existing.coverUrl);
    }
    await this.profilesRepo.update({ user: { id: userId } }, { coverUrl });
    await this.logActivity(userId, 'photo', 'Updated cover photo', { coverUrl });
    return this.getProfile(userId);
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    const existing = await this.ensureProfile(userId);
    if (existing.avatarUrl && existing.avatarUrl !== avatarUrl) {
      await this.deleteUploadedFile(existing.avatarUrl);
    }
    await this.profilesRepo.update({ user: { id: userId } }, { avatarUrl });
    await this.logActivity(userId, 'photo', 'Updated profile picture', { avatarUrl });
    return this.getProfile(userId);
  }

  // Clear the cover photo and delete its file, reverting to the placeholder
  // (#348). Column is already nullable, so no schema change.
  async removeCover(userId: string) {
    const existing = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    if (existing?.coverUrl) await this.deleteUploadedFile(existing.coverUrl);
    await this.profilesRepo.update({ user: { id: userId } }, { coverUrl: null as any });
    await this.logActivity(userId, 'photo', 'Removed cover photo', {});
    return this.getProfile(userId);
  }

  // Clear the avatar and delete its file, reverting to the initials placeholder
  // (#358).
  async removeAvatar(userId: string) {
    const existing = await this.profilesRepo.findOne({ where: { user: { id: userId } } });
    if (existing?.avatarUrl) await this.deleteUploadedFile(existing.avatarUrl);
    await this.profilesRepo.update({ user: { id: userId } }, { avatarUrl: null as any });
    await this.logActivity(userId, 'photo', 'Removed profile picture', {});
    return this.getProfile(userId);
  }

  async deleteAccount(userId: string) {
    await this.usersRepo.update(userId, {
      email: `deleted-${userId}@deleted.invalid` as any,
      phone: `+000${userId.replace(/-/g, '').slice(0, 10)}` as any,
      fullName: 'حساب محذوف',
      username: null as any,
      status: 'banned' as any,
    });
    await this.usersRepo.softDelete(userId);
  }

  async exportUserData(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    const profile = await this.profilesRepo.findOne({
      where: { user: { id: userId } },
      relations: ['workEntries', 'educationEntries'],
    });
    return {
      exportedAt: new Date().toISOString(),
      account: {
        id: user?.id,
        email: user?.email,
        phone: user?.phone,
        username: user?.username,
        createdAt: user?.createdAt,
      },
      profile: profile ?? null,
    };
  }

  // Remove a previously uploaded file from disk when it's replaced, so old
  // avatars/covers don't accumulate. Only touches paths under ./uploads.
  private async deleteUploadedFile(urlPath: string) {
    try {
      const rel = urlPath.replace(/^\/+/, '');
      if (!rel.startsWith('uploads/')) return;
      await fs.unlink(join(process.cwd(), rel));
    } catch {
      /* file already gone or never existed — ignore */
    }
  }

  async getActivityLog(userId: string, dto: ActivityLogQueryDto) {
    const { page = 1, limit = 50, year, type } = dto;

    // The activity_logs table only ever recorded `photo` events (avatar/cover
    // updates) — posts/likes/comments/friends were never logged, so the tab
    // looked empty and the type filters returned nothing (#832 follow-up).
    // Build the timeline by aggregating the user's REAL activity from the
    // source tables, plus any explicitly-logged activity rows.
    const PER_SOURCE = 200;
    const want = (t: string) => !type || type === t;
    type Item = { type: string; description: string; createdAt: Date; metadata?: any };
    const items: Item[] = [];

    if (want('post')) {
      const posts = await this.postsRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' }, take: PER_SOURCE,
      });
      for (const p of posts) {
        const snippet = (p.content || '').trim().slice(0, 80);
        items.push({ type: 'post', description: snippet ? `نشر منشوراً: ${snippet}` : 'نشر منشوراً', createdAt: p.createdAt, metadata: { postId: p.id } });
      }
    }

    if (want('comment')) {
      const comments = await this.dataSource.getRepository(Comment).find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' }, take: PER_SOURCE,
      });
      for (const c of comments) {
        const snippet = (c.content || '').trim().slice(0, 80);
        items.push({ type: 'comment', description: snippet ? `علّق: ${snippet}` : 'أضاف تعليقاً', createdAt: c.createdAt });
      }
    }

    if (want('like')) {
      const reactions = await this.dataSource.getRepository(Reaction).find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' }, take: PER_SOURCE,
      });
      for (const r of reactions) {
        items.push({ type: 'like', description: 'تفاعل مع منشور', createdAt: r.createdAt });
      }
    }

    if (want('friend_add')) {
      const friendships = await this.dataSource.getRepository(Friendship).find({
        where: [
          { requesterId: userId, status: FriendshipStatus.ACCEPTED },
          { addresseeId: userId, status: FriendshipStatus.ACCEPTED },
        ],
        order: { createdAt: 'DESC' }, take: PER_SOURCE,
      });
      for (const f of friendships) {
        items.push({ type: 'friend_add', description: 'أصبح صديقاً جديداً', createdAt: f.createdAt });
      }
    }

    // Explicitly-logged rows (photo/video/tag — e.g. avatar & cover updates).
    const logged = await this.activityRepo.find({
      where: { userId, isHidden: false, ...(type ? { type: type as any } : {}) },
      order: { createdAt: 'DESC' }, take: PER_SOURCE,
    });
    // Avoid double-counting types we already aggregated from source tables.
    const aggregatedTypes = new Set(['post', 'comment', 'like', 'friend_add']);
    for (const a of logged) {
      if (aggregatedTypes.has(a.type as any)) continue;
      items.push({ type: a.type as any, description: a.description, createdAt: a.createdAt, metadata: a.metadata });
    }

    // Apply the year filter across the merged set, sort newest-first, paginate.
    const filtered = year
      ? items.filter((i) => new Date(i.createdAt).getFullYear() === parseInt(year))
      : items;
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = filtered.length;
    const data = filtered.slice((page - 1) * limit, (page - 1) * limit + limit);
    return { data, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) };
  }

  async getFriends(userId: string, page = 1, limit = 20, viewerId?: string) {
    // "Who can view my friends" was never consulted at all — the friends list
    // stayed visible to every viewer regardless of the setting (#110). Same
    // fix shape as getUserPosts (#103).
    if (viewerId && viewerId !== userId) {
      try {
        const privacy: any = await this.settingsService.getPrivacySettings(userId);
        const setting = privacy?.whoCanSeeFriends ?? 'friends';
        if (setting === 'only_me') return { data: [], total: 0 };
        if (setting === 'friends' || setting === 'friends_of_friends') {
          const friendIds = await this.friendsService.getFriendIds(userId);
          if (!friendIds.includes(viewerId)) return { data: [], total: 0 };
        }
      } catch {
        /* fail open on privacy-lookup errors, matching the existing pattern elsewhere */
      }
    }
    return this.friendsService.getFriends(userId, page, limit);
  }

  async getFriendshipStatus(userId: string, viewerId: string) {
    return this.friendsService.getFriendshipStatus(viewerId, userId);
  }

  async getPhotos(userId: string, page = 1, limit = 20) {
    const [activities, total] = await this.activityRepo.findAndCount({
      where: { userId, type: 'photo' as any },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: activities, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getVideos(userId: string, page = 1, limit = 20) {
    const [activities, total] = await this.activityRepo.findAndCount({
      where: { userId, type: 'video' as any },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: activities, total, page, totalPages: Math.ceil(total / limit) };
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
