import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { signMediaPath } from '../../common/utils/media-token';
import { EventsService } from '../services/events.service';
import { CreateEventDto, UpdateRsvpDto } from '../dto/create-event.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

const EVENT_COVER_INTERCEPTOR = FileInterceptor('coverPhoto', {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const okExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);
    const okMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype);
    if (!okExt || !okMime) {
      return cb(new BadRequestException('Only image files are allowed'), false);
    }
    cb(null, true);
  },
});

@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventsController {
  private logger = new Logger(EventsController.name);

  constructor(private eventsService: EventsService) {}

  // No button/input existed anywhere to upload an event cover photo, on
  // create OR edit -- the banner was a rigid default gradient with no way
  // to customize it at all (#374). Same sharp-validate + signed-media-url
  // pattern already used for group/page covers.
  private async processCoverPhoto(file?: Express.Multer.File): Promise<string | undefined> {
    if (!file) return undefined;
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const destDir = join(process.cwd(), 'uploads', 'covers');
    mkdirSync(destDir, { recursive: true });
    let processed: Buffer;
    try {
      processed = await sharp(file.buffer).resize(1200, 375, { fit: 'cover', position: 'centre', withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    } catch {
      throw new BadRequestException('File is not a valid image');
    }
    writeFileSync(join(destDir, filename), processed);
    const mediaPath = `covers/${filename}`;
    return `/api/v1/media/${mediaPath}?t=${signMediaPath(mediaPath)}`;
  }

  @Post()
  @UseInterceptors(EVENT_COVER_INTERCEPTOR)
  async create(@Body() dto: CreateEventDto, @UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: User) {
    this.logger.log(`POST /events - Creating event: ${dto.title}`);
    // (removed debug log of the full request DTO — it leaked PII into logs)
    try {
      const coverPhoto = await this.processCoverPhoto(file);
      if (coverPhoto) dto.coverPhoto = coverPhoto;
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
  @UseInterceptors(EVENT_COVER_INTERCEPTOR)
  async update(@Param('id') id: string, @Body() dto: Partial<CreateEventDto>, @UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: User) {
    const coverPhoto = await this.processCoverPhoto(file);
    if (coverPhoto) dto.coverPhoto = coverPhoto;
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