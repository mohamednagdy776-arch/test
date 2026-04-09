import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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
  constructor(private eventsService: EventsService) {}

  @Post()
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: User) {
    const event = await this.eventsService.create(dto, user);
    return ok(event, 'Event created');
  }

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.eventsService.findAll(query.page!, query.limit!);
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

  @Post(':id/rsvp')
  async rsvp(@Param('id') id: string, @Body() dto: UpdateRsvpDto, @CurrentUser() user: User) {
    const event = await this.eventsService.rsvp(id, user, dto.status);
    return ok(event, 'RSVP updated');
  }
}