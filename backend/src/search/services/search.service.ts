import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Profile } from '../../users/entities/profile.entity';
import { Post } from '../../posts/entities/post.entity';
import { Group } from '../../groups/entities/group.entity';
import { Page } from '../../pages/entities/page.entity';
import { Event } from '../../events/entities/event.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)    private userRepo: Repository<User>,
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
    @InjectRepository(Post)    private postRepo: Repository<Post>,
    @InjectRepository(Group)   private groupRepo: Repository<Group>,
    @InjectRepository(Page)    private pageRepo: Repository<Page>,
    @InjectRepository(Event)   private eventRepo: Repository<Event>,
  ) {}

  async search(query: string, userId: string, category?: string, minAge?: number, maxAge?: number, gender?: string) {
    const q = `%${query.trim()}%`;

    const userSearch = async () => {
      const qb = this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where(
          `user.firstName      ILIKE :q
        OR user.lastName       ILIKE :q
        OR user.username       ILIKE :q
        OR user.fullName       ILIKE :q
        OR profile.fullName    ILIKE :q
        OR profile.country     ILIKE :q
        OR profile.city        ILIKE :q
        OR profile.jobTitle    ILIKE :q
        OR profile.bio         ILIKE :q
        OR profile.sect        ILIKE :q
        OR profile.education   ILIKE :q
        OR profile.lifestyle   ILIKE :q
        OR profile.jobTitle    ILIKE :q`,
          { q },
        )
        .andWhere('user.id != :userId', { userId })
        .andWhere('user.status = :status', { status: 'active' })
        // Block enforcement (#758): hide users who blocked me or whom I blocked.
        .andWhere(
          `user.id NOT IN (
             SELECT blocked_id FROM blocks WHERE blocker_id = :userId
             UNION
             SELECT blocker_id FROM blocks WHERE blocked_id = :userId
           )`,
        );
      // #24: age filters (already sanitized in the controller — negatives ignored).
      if (minAge) qb.andWhere('profile.age >= :minAge', { minAge });
      if (maxAge) qb.andWhere('profile.age <= :maxAge', { maxAge });
      // The gender filter was accepted by the frontend but silently dropped
      // before reaching this endpoint — see #119, #131.
      if (gender) qb.andWhere('user.gender = :gender', { gender });
      const users = await qb.take(20).getMany();

      return users.map(u => ({
        id:          u.id,
        firstName:   u.firstName,
        lastName:    u.lastName,
        username:    u.username,
        gender:      u.gender,
        fullName:    u.profile?.fullName    || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
        avatarUrl:   u.profile?.avatarUrl   ?? null,
        country:     u.profile?.country     ?? null,
        city:        u.profile?.city        ?? null,
        jobTitle:    u.profile?.jobTitle    ?? null,
        bio:         u.profile?.bio         ?? null,
        sect:        u.profile?.sect        ?? null,
        age:         u.profile?.age         ?? null,
        education:   u.profile?.education   ?? null,
        lifestyle:   u.profile?.lifestyle   ?? null,
        prayerLevel: u.profile?.prayerLevel ?? null,
      }));
    };

    const postSearch = async () => {
      const posts = await this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.content ILIKE :q', { q })
        .andWhere('post.audience = :aud', { aud: 'public' })
        .orderBy('post.createdAt', 'DESC')
        .take(10)
        .getMany();

      return posts.map(p => ({
        id:        p.id,
        content:   p.content,
        postType:  p.postType,
        createdAt: p.createdAt,
        author: {
          id:        (p as any).user?.id,
          firstName: (p as any).user?.firstName,
          lastName:  (p as any).user?.lastName,
          username:  (p as any).user?.username,
        },
      }));
    };

    const groupSearch = () =>
      this.groupRepo
        .createQueryBuilder('group')
        .select(['group.id', 'group.name', 'group.description', 'group.privacy'])
        .where('group.name ILIKE :q OR group.description ILIKE :q', { q })
        .take(10)
        .getMany();

    const pageSearch = () =>
      this.pageRepo
        .createQueryBuilder('page')
        .select(['page.id', 'page.name', 'page.description', 'page.category'])
        .where('page.name ILIKE :q OR page.description ILIKE :q', { q })
        .take(10)
        .getMany();

    const eventSearch = () =>
      this.eventRepo
        .createQueryBuilder('event')
        .select(['event.id', 'event.title', 'event.description', 'event.startDate', 'event.location'])
        .where('event.title ILIKE :q OR event.description ILIKE :q OR event.location ILIKE :q', { q })
        .take(10)
        .getMany();

    // Category-filtered search
    if (category && category !== 'All') {
      const cat = category.toLowerCase();
      try {
        if (cat === 'users')  return { users: await userSearch(),  posts: [], groups: [], pages: [], events: [] };
        if (cat === 'posts')  return { users: [], posts: await postSearch(),  groups: [], pages: [], events: [] };
        if (cat === 'groups') return { users: [], posts: [], groups: await groupSearch(), pages: [], events: [] };
        if (cat === 'pages')  return { users: [], posts: [], groups: [], pages: await pageSearch(),  events: [] };
        if (cat === 'events') return { users: [], posts: [], groups: [], pages: [], events: await eventSearch() };
      } catch (e) {
        console.error(`Search error [${cat}]:`, e);
      }
      return { users: [], posts: [], groups: [], pages: [], events: [] };
    }

    // All categories
    try {
      const [users, posts, groups, pages, events] = await Promise.all([
        userSearch(), postSearch(), groupSearch(), pageSearch(), eventSearch(),
      ]);
      return { users, posts, groups, pages, events };
    } catch (e) {
      console.error('Search error:', e);
      return { users: [], posts: [], groups: [], pages: [], events: [] };
    }
  }

  async autocomplete(query: string, viewerId?: string) {
    if (!query || query.trim().length < 2) return [];
    const q = `%${query.trim()}%`;

    const [users, groups, pages, events] = await Promise.all([
      (() => {
        const qb = this.userRepo
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.profile', 'profile')
          .where(
            'user.firstName ILIKE :q OR user.lastName ILIKE :q OR user.username ILIKE :q OR user.fullName ILIKE :q OR profile.fullName ILIKE :q',
            { q },
          )
          .andWhere('user.status = :status', { status: 'active' });
        if (viewerId) qb.andWhere('user.id != :viewerId', { viewerId });
        return qb.take(5).getMany().then(users =>
          users.map(u => ({
            id:        u.id,
            firstName: u.firstName,
            lastName:  u.lastName,
            username:  u.username,
            fullName:  u.profile?.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
            avatar:    u.profile?.avatarUrl ?? null,
          })),
        );
      })(),
      this.groupRepo
        .createQueryBuilder('group')
        .select(['group.id', 'group.name'])
        .where('group.name ILIKE :q', { q })
        .take(3)
        .getMany(),
      this.pageRepo
        .createQueryBuilder('page')
        .select(['page.id', 'page.name'])
        .where('page.name ILIKE :q', { q })
        .take(3)
        .getMany(),
      this.eventRepo
        .createQueryBuilder('event')
        .select(['event.id', 'event.title'])
        .where('event.title ILIKE :q', { q })
        .take(3)
        .getMany(),
    ]);

    return { users, groups, pages, events };
  }

  async searchByLocation(query: string, coordinates?: { lat: number; lng: number; radius?: number }) {
    if (!query && !coordinates) return [];
    const q = query ? `%${query.trim()}%` : '%';
    return this.eventRepo
      .createQueryBuilder('event')
      .select(['event.id', 'event.title', 'event.location', 'event.startDate'])
      .where('event.location ILIKE :q', { q })
      .take(20)
      .getMany();
  }
}
