import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Match } from '../../matching/entities/match.entity';
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
    @InjectRepository(Match) private matchRepo: Repository<Match>,
  ) {}

  // Get messages for a match
  @Get(':matchId/messages')
  async getMessages(@Param('matchId') matchId: string, @CurrentUser() user: User) {
    // Use query builder for more reliable nested relation query
    const messages = await this.messagesRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'profile')
      .where('message.match_id = :matchId', { matchId })
      .orderBy('message.createdAt', 'ASC')
      .getMany();

    return ok(messages.map((m) => ({
      id: m.id,
      content: m.contentEncrypted,
      senderId: m.sender?.id,
      senderName: m.sender?.profile?.fullName || null,
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
    // Check if a chat match already exists between these users
    const existingMatch = await this.matchRepo
      .createQueryBuilder('match')
      .where('(match.user1 = :userId AND match.user2 = :targetId) OR (match.user1 = :targetId AND match.user2 = :userId)', {
        userId: user.id,
        targetId: dto.targetUserId,
      })
      .andWhere('match.status = :status', { status: 'chat' })
      .getOne();

    if (existingMatch) {
      // Return existing chat match
      return ok({
        matchId: existingMatch.id,
        userId: dto.targetUserId,
        createdAt: existingMatch.createdAt,
      }, 'Conversation ready');
    }

    // Create a new chat match with proper UUID
    const match = this.matchRepo.create({
      user1: { id: user.id } as any,
      user2: { id: dto.targetUserId } as any,
      status: 'chat' as any,
      score: 0,
    });
    const savedMatch = await this.matchRepo.save(match);

    return ok({
      matchId: savedMatch.id,
      userId: dto.targetUserId,
      createdAt: savedMatch.createdAt,
    }, 'Conversation ready');
  }
}
