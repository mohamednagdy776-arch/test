import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
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

  async search(
    query: string, userId: string, category?: string, minAge?: number, maxAge?: number, gender?: string,
    country?: string, city?: string, education?: string, sect?: string, lifestyle?: string, prayerLevel?: string,
    // Per-tab filters (#352): groups/pages/events/posts each had no dedicated
    // filters of their own and only ever reused the People fields above.
    groupCategory?: string, groupLocation?: string, pageCategory?: string,
    eventLocation?: string, eventDateFrom?: string, eventDateTo?: string,
    postType?: string, postDateFrom?: string, postDateTo?: string,
  ) {
    const q = `%${(query || '').trim()}%`;

    const userSearch = async () => {
      // The free-text match is itself a big OR group; every filter below
      // (self-exclusion, active status, block list, age, gender) MUST bind
      // as a sibling AND condition, not get absorbed into that OR group. The
      // previous version passed the OR group to `.where()` as one long raw
      // multi-line string and relied on QueryBuilder's implicit wrapping —
      // live behaviour showed every subsequent `.andWhere()` having no
      // effect at all (a search for your own username returned yourself;
      // minAge/maxAge/gender were no-ops), which is exactly the symptom of
      // the OR group not actually being isolated in its own parens. Using an
      // explicit `Brackets` group removes any ambiguity (#119, #131).
      const qb = this.userRepo
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.profile', 'profile')
        .where(
          new Brackets((qb2) => {
            qb2
              .where('user.firstName ILIKE :q', { q })
              .orWhere('user.lastName ILIKE :q', { q })
              .orWhere('user.username ILIKE :q', { q })
              .orWhere('user.fullName ILIKE :q', { q })
              .orWhere('profile.fullName ILIKE :q', { q })
              .orWhere('profile.country ILIKE :q', { q })
              .orWhere('profile.city ILIKE :q', { q })
              .orWhere('profile.jobTitle ILIKE :q', { q })
              .orWhere('profile.bio ILIKE :q', { q })
              .orWhere('profile.sect ILIKE :q', { q })
              .orWhere('profile.education ILIKE :q', { q })
              .orWhere('profile.lifestyle ILIKE :q', { q });
          }),
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
      // Country/city/education were accepted by the Advanced Search UI but
      // never forwarded past the frontend at all (only usable as free-text
      // terms inside the OR bracket above, not as precise filters) — and an
      // empty free-text query short-circuited to zero results before any of
      // this ever ran regardless (#245).
      if (country) qb.andWhere('profile.country ILIKE :country', { country: `%${country}%` });
      if (city) qb.andWhere('profile.city ILIKE :city', { city: `%${city}%` });
      if (education) qb.andWhere('profile.education = :education', { education });
      // sect/lifestyle/prayerLevel were accepted by the Advanced Search UI
      // and even joined into the free-text OR bracket above, but never
      // applied as their own precise filters -- selecting a specific value
      // had zero effect on results (#358, #346).
      if (sect) qb.andWhere('profile.sect = :sect', { sect });
      if (lifestyle) qb.andWhere('profile.lifestyle = :lifestyle', { lifestyle });
      if (prayerLevel) qb.andWhere('profile.prayerLevel = :prayerLevel', { prayerLevel });
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
      const qb = this.postRepo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.content ILIKE :q', { q })
        .andWhere('post.audience = :aud', { aud: 'public' });
      if (postType) qb.andWhere('post.postType = :postType', { postType });
      if (postDateFrom) qb.andWhere('post.createdAt >= :postDateFrom', { postDateFrom });
      if (postDateTo) qb.andWhere('post.createdAt <= :postDateTo', { postDateTo });
      const posts = await qb
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

    const groupSearch = () => {
      // Same class of bug as userSearch's #119/#131 fix above: a raw
      // multi-clause OR string passed straight to .where() isn't reliably
      // isolated in its own parens, so any subsequent .andWhere() (the new
      // groupCategory/groupLocation filters) had no effect at all. Wrap the
      // OR group in an explicit Brackets().
      const qb = this.groupRepo
        .createQueryBuilder('group')
        .select(['group.id', 'group.name', 'group.description', 'group.privacy', 'group.category', 'group.location'])
        .where(new Brackets((qb2) => {
          qb2.where('group.name ILIKE :q', { q }).orWhere('group.description ILIKE :q', { q });
        }));
      if (groupCategory) qb.andWhere('group.category ILIKE :groupCategory', { groupCategory: `%${groupCategory}%` });
      if (groupLocation) qb.andWhere('group.location ILIKE :groupLocation', { groupLocation: `%${groupLocation}%` });
      return qb.take(10).getMany();
    };

    const pageSearch = () => {
      const qb = this.pageRepo
        .createQueryBuilder('page')
        .select(['page.id', 'page.name', 'page.description', 'page.category'])
        .where(new Brackets((qb2) => {
          qb2.where('page.name ILIKE :q', { q }).orWhere('page.description ILIKE :q', { q });
        }));
      if (pageCategory) qb.andWhere('page.category ILIKE :pageCategory', { pageCategory: `%${pageCategory}%` });
      return qb.take(10).getMany();
    };

    const eventSearch = () => {
      const qb = this.eventRepo
        .createQueryBuilder('event')
        .select(['event.id', 'event.title', 'event.description', 'event.startDate', 'event.location'])
        .where(new Brackets((qb2) => {
          qb2
            .where('event.title ILIKE :q', { q })
            .orWhere('event.description ILIKE :q', { q })
            .orWhere('event.location ILIKE :q', { q });
        }));
      if (eventLocation) qb.andWhere('event.location ILIKE :eventLocation', { eventLocation: `%${eventLocation}%` });
      if (eventDateFrom) qb.andWhere('event.startDate >= :eventDateFrom', { eventDateFrom });
      if (eventDateTo) qb.andWhere('event.startDate <= :eventDateTo', { eventDateTo });
      return qb.take(10).getMany();
    };

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
