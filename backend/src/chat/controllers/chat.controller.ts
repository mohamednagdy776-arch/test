import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';
import { IsString, IsUUID } from 'class-validator';

class SendMessageDto {
  @IsString() matchId: string;
  @IsString() content: string;
}

class CreateConversationDto {
  @IsUUID() targetUserId: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
  ) {}

  // Get messages for a match
  @Get(':matchId/messages')
  async getMessages(@Param('matchId') matchId: string, @CurrentUser() user: User) {
    const messages = await this.messagesRepo.find({
      where: { match: { id: matchId } },
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });
    return ok(messages.map((m) => ({
      id: m.id,
      content: m.contentEncrypted,
      senderId: m.sender?.id,
      isOwn: m.sender?.id === user.id,
      type: m.type,
      createdAt: m.createdAt,
    })));
  }

  // Send a message (REST fallback — real-time via WebSocket)
  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto, @CurrentUser() user: User) {
    const msg = this.messagesRepo.create({
      match: { id: dto.matchId } as any,
      sender: { id: user.id } as any,
      contentEncrypted: dto.content,
      type: 'text',
    });
    const saved = await this.messagesRepo.save(msg);
    // Return without sensitive sender data
    return ok({
      id: saved.id,
      matchId: dto.matchId,
      senderId: user.id,
      content: saved.contentEncrypted,
      type: saved.type,
      createdAt: saved.createdAt,
    }, 'Message sent');
  }

  // Create a conversation (returns a match ID for chat)
  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto, @CurrentUser() user: User) {
    // Return a virtual conversation ID that can be used for messaging
    // The conversation is identified by the two user IDs combined
    const conversationId = [user.id, dto.targetUserId].sort().join('-');
    return ok({
      conversationId,
      userId: dto.targetUserId,
      createdAt: new Date().toISOString(),
    }, 'Conversation ready');
  }
}
