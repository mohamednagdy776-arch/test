import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './controllers/chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
