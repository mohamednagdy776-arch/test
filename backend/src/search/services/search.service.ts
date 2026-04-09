import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Group } from '../../groups/entities/group.entity';
import { Page } from '../../pages/entities/page.entity';
import { Event } from '../../events/entities/event.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Group) private groupRepo: Repository<Group>,
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
  ) {}

  async search(query: string, userId: string, category?: string) {
    const searchTerm = `%${query.trim()}%`;

    const searches = {
      users: this.userRepo
        .createQueryBuilder('user')
        .select(['user.id', 'user.firstName', 'user.lastName', 'user.avatar', 'user.username'])
        .where('user.firstName ILIKE :q OR user.lastName ILIKE :q OR user.username ILIKE :q', { q: searchTerm })
        .take(20)
        .getMany(),
      posts: this.postRepo
        .createQueryBuilder('post')
        .select(['post.id', 'post.content', 'post.createdAt'])
        .leftJoin('post.user', 'user')
        .addSelect(['user.id', 'user.firstName', 'user.lastName', 'user.avatar'])
        .where('post.content ILIKE :q', { q: searchTerm })
        .orderBy('post.createdAt', 'DESC')
        .take(20)
        .getMany(),
      groups: this.groupRepo
        .createQueryBuilder('group')
        .select(['group.id', 'group.name', 'group.description', 'group.privacy'])
        .where('group.name ILIKE :q OR group.description ILIKE :q', { q: searchTerm })
        .take(10)
        .getMany(),
      pages: this.pageRepo
        .createQueryBuilder('page')
        .select(['page.id', 'page.name', 'page.description', 'page.category'])
        .where('page.name ILIKE :q OR page.description ILIKE :q', { q: searchTerm })
        .take(10)
        .getMany(),
      events: this.eventRepo
        .createQueryBuilder('event')
        .select(['event.id', 'event.title', 'event.description', 'event.startDate', 'event.location'])
        .where('event.title ILIKE :q OR event.description ILIKE :q OR event.location ILIKE :q', { q: searchTerm })
        .take(10)
        .getMany(),
    };

    if (category && category !== 'All') {
      const validCategories = ['users', 'posts', 'groups', 'pages', 'events'];
      if (validCategories.includes(category.toLowerCase())) {
        const cat = category.toLowerCase() as 'users' | 'posts' | 'groups' | 'pages' | 'events';
        const result = await searches[cat];
        return { [cat]: result };
      }
    }

    const [users, posts, groups, pages, events] = await Promise.all(Object.values(searches));

    return {
      users,
      posts,
      groups,
      pages,
      events,
    };
  }

  async autocomplete(query: string) {
    if (!query || query.trim().length < 2) return [];

    const searchTerm = `%${query.trim()}%`;

    const [users, groups, pages, events] = await Promise.all([
      this.userRepo
        .createQueryBuilder('user')
        .select(['user.id', 'user.firstName', 'user.lastName', 'user.username'])
        .where('user.firstName ILIKE :q OR user.lastName ILIKE :q OR user.username ILIKE :q', { q: searchTerm })
        .take(5)
        .getMany(),
      this.groupRepo
        .createQueryBuilder('group')
        .select(['group.id', 'group.name'])
        .where('group.name ILIKE :q', { q: searchTerm })
        .take(3)
        .getMany(),
      this.pageRepo
        .createQueryBuilder('page')
        .select(['page.id', 'page.name'])
        .where('page.name ILIKE :q', { q: searchTerm })
        .take(3)
        .getMany(),
      this.eventRepo
        .createQueryBuilder('event')
        .select(['event.id', 'event.title'])
        .where('event.title ILIKE :q', { q: searchTerm })
        .take(3)
        .getMany(),
    ]);

    return {
      users,
      groups,
      pages,
      events,
    };
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