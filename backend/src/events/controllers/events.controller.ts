import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from '../services/events.service';
import { CreateEventDto, UpdateRsvpDto } from '../dto/create-event.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventsController {
  private logger = new Logger(EventsController.name);

  constructor(private eventsService: EventsService) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: User) {
    this.logger.log(`POST /events - Creating event: ${dto.title}`);
    // (removed debug log of the full request DTO — it leaked PII into logs)
    try {
      const event = await this.eventsService.create(dto, user);
      this.logger.log(`Event created successfully: ${event.id}`);
      return ok(event, 'Event created');
    } catch (err) {
      this.logger.error('Error creating event:', err);
      if (err instanceof HttpException) throw err;
      throw new HttpException(err.message || 'Failed to create event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query() query: PaginationDto, @CurrentUser() user?: User) {
    const { data, total } = await this.eventsService.findAll(query.page!, query.limit!, user?.id);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('upcoming')
  async upcoming(@Query() query: PaginationDto, @CurrentUser() user?: User) {
    const { data, total } = await this.eventsService.findAll(query.page!, query.limit!, user?.id);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('my')
  async myEvents(@CurrentUser() user: User) {
    const events = await this.eventsService.getMyEvents(user.id);
    return ok(events);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user?: User) {
    const event = await this.eventsService.findOne(id, user?.id);
    return ok(event);
  }

  // No edit endpoint existed at all -- event creators had no way to update
  // details after creation (#194).
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateEventDto>, @CurrentUser() user: User) {
    const event = await this.eventsService.update(id, user.id, dto);
    return ok(event, 'Event updated');
  }

  // Attendee counts were shown as plain non-interactive numbers -- no
  // endpoint returned the actual list of people who RSVP'd (#194).
  @Get(':id/attendees')
  async attendees(@Param('id') id: string, @Query('status') status?: 'going' | 'interested' | 'not_going') {
    return ok(await this.eventsService.getAttendees(id, status ?? 'going'));
  }

  @Post(':id/rsvp')
  async rsvp(@Param('id') id: string, @Body() dto: UpdateRsvpDto, @CurrentUser() user: User) {
    const event = await this.eventsService.rsvp(id, user, dto.status);
    return ok(event, 'RSVP updated');
  }
}