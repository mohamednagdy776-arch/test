import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventRSVP } from './entities/event-rsvp.entity';
import { EventsService } from './services/events.service';
import { EventsController } from './controllers/events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventRSVP])],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}