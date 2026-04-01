import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { Match } from '../matching/entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Match])],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
