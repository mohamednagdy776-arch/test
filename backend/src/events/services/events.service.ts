import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, LessThanOrEqual, MoreThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Event } from '../entities/event.entity';
import { EventRSVP } from '../entities/event-rsvp.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { User } from '../../auth/entities/user.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class EventsService {
  private logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(EventRSVP) private rsvpRepo: Repository<EventRSVP>,
    private notifications: NotificationsService,
  ) {}

  // No notification was ever sent when an event started (#112). Runs every
  // 5 minutes; startNotificationSent guards against re-notifying on later
  // ticks. The 10-minute lower bound only matters if a tick is ever missed
  // (deploy restart, etc) -- it won't reach back further than that.
  @Cron('*/5 * * * *')
  async notifyStartingEvents() {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const startingEvents = await this.eventsRepo.find({
      where: { startDate: LessThanOrEqual(now), startNotificationSent: false },
    });
    const dueEvents = startingEvents.filter((e) => e.startDate > tenMinutesAgo);
    for (const event of dueEvents) {
      const rsvps = await this.rsvpRepo.find({
        where: { event: { id: event.id }, status: In(['going', 'interested']) },
        relations: ['user'],
      });
      for (const rsvp of rsvps) {
        await this.notifications.notifyUser(rsvp.user.id, event.createdBy?.id ?? rsvp.user.id, 'event_reminder', `بدأ الحدث "${event.title}" الآن`, 'event', event.id);
      }
      event.startNotificationSent = true;
      await this.eventsRepo.save(event);
    }
    if (dueEvents.length > 0) {
      this.logger.log(`Sent start notifications for ${dueEvents.length} event(s)`);
    }
  }

  async create(dto: CreateEventDto, user: User) {
    this.logger.log(`Creating event: ${dto.title} by user ${user.id}`);
    // (removed debug log of the full DTO — it leaked PII into logs)
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    // #94: reject logically invalid date ranges.
    if (endDate && endDate < startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
    // #32: the list only shows events with start_date >= NOW(), so an event whose
    // time has already fully passed would be created but never appear. Reject it up
    // front instead of silently creating an invisible event.
    if ((endDate ?? startDate) < new Date()) {
      throw new BadRequestException('لا يمكن إنشاء حدث في وقت ماضٍ');
    }
    const event = this.eventsRepo.create({
      ...dto,
      startDate,
      endDate,
      createdBy: user,
    });
    try {
      const saved = await this.eventsRepo.save(event);
      this.logger.log(`Event created with id: ${saved.id}`);
      await this.rsvpRepo.save(this.rsvpRepo.create({
        event: saved,
        user,
        status: 'going',
      }));
      return saved;
    } catch (err) {
      this.logger.error('Error creating event:', err);
      throw err;
    }
  }

  // #31: attach real going/interested/notGoing counts to a list of events with a
  // single grouped query (instead of N+1), matching the goingCount/interestedCount
  // field names that findOne returns and the cards read.
  private async attachCounts<T extends { id: string }>(
    events: T[],
  ): Promise<(T & { goingCount: number; interestedCount: number; notGoingCount: number })[]> {
    if (events.length === 0) return [];
    const ids = events.map((e) => e.id);
    const rows = await this.rsvpRepo
      .createQueryBuilder('rsvp')
      .select('rsvp.event_id', 'eventId')
      .addSelect('rsvp.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('rsvp.event_id IN (:...ids)', { ids })
      .groupBy('rsvp.event_id')
      .addGroupBy('rsvp.status')
      .getRawMany();
    const countsByEvent = new Map<string, { goingCount: number; interestedCount: number; notGoingCount: number }>();
    for (const e of events) countsByEvent.set(e.id, { goingCount: 0, interestedCount: 0, notGoingCount: 0 });
    for (const r of rows) {
      const c = countsByEvent.get(r.eventId);
      if (!c) continue;
      const n = Number(r.count);
      if (r.status === 'going') c.goingCount = n;
      else if (r.status === 'interested') c.interestedCount = n;
      else if (r.status === 'not_going') c.notGoingCount = n;
    }
    return events.map((e) => ({ ...e, ...countsByEvent.get(e.id)! }));
  }

  async findAll(page: number, limit: number, userId?: string) {
    const [rawData, total] = await this.eventsRepo
      .createQueryBuilder('event')
      .where('event.start_date >= NOW()')
      .orderBy('event.start_date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = await this.attachCounts(rawData);

    if (!userId) {
      return { data, total };
    }

    const rsvps = await this.rsvpRepo.find({
      where: { user: { id: userId } },
      relations: ['event'],
    });
    const rsvpMap = new Map(rsvps.filter(r => r.event).map(r => [r.event.id, r.status]));

    const dataWithRsvp = data.map(event => ({
      ...event,
      userRsvp: rsvpMap.get(event.id) || null,
    }));

    return { data: dataWithRsvp, total };
  }

  async findOne(eventId: string, userId?: string) {
    // createdBy wasn't loaded here (no `relations`), so the frontend could
    // never actually tell the creator apart from anyone else -- there was no
    // isOwner to gate an edit button on (#194).
    const event = await this.eventsRepo.findOne({ where: { id: eventId }, relations: ['createdBy'] });
    if (!event) throw new NotFoundException('Event not found');
    const rsvpCounts = await this.getRsvpCounts(eventId);
    let userRsvp = null;
    if (userId) {
      const rsvp = await this.rsvpRepo.findOne({
        where: { event: { id: eventId }, user: { id: userId } },
      });
      if (rsvp) userRsvp = rsvp.status;
    }
    const isOwner = !!userId && event.createdBy?.id === userId;
    return { ...event, ...rsvpCounts, userRsvp, isOwner };
  }

  async update(eventId: string, userId: string, dto: Partial<CreateEventDto>) {
    const event = await this.eventsRepo.findOne({ where: { id: eventId }, relations: ['createdBy'] });
    if (!event) throw new NotFoundException('Event not found');
    if (event.createdBy?.id !== userId) throw new ConflictException('Only the event creator can edit this event');
    const { title, description, location, coverPhoto, privacy } = dto as any;
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (startDate && endDate && endDate < startDate) {
      throw new BadRequestException('endDate must be after startDate');
    }
    await this.eventsRepo.update(eventId, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(location !== undefined && { location }),
      ...(coverPhoto !== undefined && { coverPhoto }),
      ...(privacy !== undefined && { privacy }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });
    return this.eventsRepo.findOne({ where: { id: eventId } });
  }

  // The attendee count chips had nothing to link to -- there was no endpoint
  // returning the actual people who RSVP'd, only aggregate counts (#194).
  async getAttendees(eventId: string, status: 'going' | 'interested' | 'not_going' = 'going') {
    const rsvps = await this.rsvpRepo.find({
      where: { event: { id: eventId }, status },
      relations: ['user'],
      order: { rsvpedAt: 'DESC' },
    });
    return rsvps.map((r) => ({
      id: r.user.id,
      username: r.user.username,
      fullName: r.user.fullName,
      rsvpedAt: r.rsvpedAt,
    }));
  }

  async rsvp(eventId: string, user: User, status: 'going' | 'interested' | 'not_going') {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    let rsvp = await this.rsvpRepo.findOne({
      where: { event: { id: eventId }, user: { id: user.id } },
    });
    if (rsvp) {
      rsvp.status = status;
      await this.rsvpRepo.save(rsvp);
    } else {
      await this.rsvpRepo.save(this.rsvpRepo.create({
        event: { id: eventId } as any,
        user,
        status,
      }));
    }
    return event;
  }

  async getMyEvents(userId: string) {
    const rsvps = await this.rsvpRepo.find({
      // "My events" = events the user is attending/interested in, not ones they
      // explicitly declined (not_going).
      where: { user: { id: userId }, status: In(['going', 'interested']) },
      relations: ['event'],
      order: { rsvpedAt: 'DESC' },
    });
    return rsvps.map(r => ({ ...r.event, userRsvp: r.status }));
  }

  async getRsvpCounts(eventId: string) {
    const going = await this.rsvpRepo.count({ where: { event: { id: eventId }, status: 'going' } });
    const interested = await this.rsvpRepo.count({ where: { event: { id: eventId }, status: 'interested' } });
    const notGoing = await this.rsvpRepo.count({ where: { event: { id: eventId }, status: 'not_going' } });
    return { goingCount: going, interestedCount: interested, notGoingCount: notGoing };
  }
}