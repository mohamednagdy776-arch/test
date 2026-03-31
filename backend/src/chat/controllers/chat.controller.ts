import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';
import { IsString } from 'class-validator';

class SendMessageDto {
  @IsString() matchId: string;
  @IsString() content: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
  ) {}

  // Get messages for a match
  @Get(':matchId/messages')
  async getMessages(@Param('matchId') matchId: string) {
    const messages = await this.messagesRepo.find({
      where: { match: { id: matchId } },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
    return ok(messages);
  }

  // Send a message (REST fallback — real-time via WebSocket)
  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto, @CurrentUser() user: User) {
    const msg = this.messagesRepo.create({
      match: { id: dto.matchId } as any,
      sender: user,
      contentEncrypted: dto.content, // plain text in dev
      type: 'text',
    });
    const saved = await this.messagesRepo.save(msg);
    return ok(saved, 'Message sent');
  }
}
