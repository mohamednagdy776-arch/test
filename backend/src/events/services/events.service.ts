import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { EventRSVP } from '../entities/event-rsvp.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(EventRSVP) private rsvpRepo: Repository<EventRSVP>,
  ) {}

  async create(dto: CreateEventDto, user: User) {
    const event = this.eventsRepo.create({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      createdBy: user,
    });
    const saved = await this.eventsRepo.save(event);
    await this.rsvpRepo.save(this.rsvpRepo.create({
      event: saved,
      user,
      status: 'going',
    }));
    return saved;
  }

  async findAll(page: number, limit: number) {
    const [data, total] = await this.eventsRepo
      .createQueryBuilder('event')
      .where('event.start_date >= NOW()')
      .orderBy('event.start_date', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { data, total };
  }

  async findOne(eventId: string, userId?: string) {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    const rsvpCounts = await this.getRsvpCounts(eventId);
    let userRsvp = null;
    if (userId) {
      const rsvp = await this.rsvpRepo.findOne({
        where: { event: { id: eventId }, user: { id: userId } },
      });
      if (rsvp) userRsvp = rsvp.status;
    }
    return { ...event, ...rsvpCounts, userRsvp };
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
      where: { user: { id: userId } },
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