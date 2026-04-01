import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { ReactionsService } from './services/reactions.service';
import { ReactionsController } from './controllers/reactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction])],
  providers: [ReactionsService],
  controllers: [ReactionsController],
  exports: [ReactionsService],
})
export class ReactionsModule {}
