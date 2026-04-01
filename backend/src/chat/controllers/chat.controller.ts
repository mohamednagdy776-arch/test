import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from '../services/chat.service';
import { SendMessageDto } from '../dto/send-message.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':matchId/messages')
  async getMessages(
    @Param('matchId') matchId: string,
    @Query() query: PaginationDto,
    @CurrentUser() user: User,
  ) {
    const { data, total } = await this.chatService.getMessages(matchId, query.page!, query.limit!);
    return ok(data.map((m: any) => ({
      id: m.id,
      content: m.contentEncrypted,
      senderId: m.sender?.id,
      senderName: m.sender?.profile?.fullName || null,
      isOwn: m.sender?.id === user.id,
      type: m.type,
      createdAt: m.createdAt,
    })));
  }

  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto, @CurrentUser() user: User) {
    const saved: any = await this.chatService.sendMessage(dto.matchId, user.id, dto.content, dto.type);
    return ok({
      id: saved.id,
      matchId: dto.matchId,
      senderId: user.id,
      content: saved.contentEncrypted,
      type: saved.type,
      createdAt: saved.createdAt,
    }, 'Message sent');
  }

  @Post('conversations')
  async createConversation(@Body() dto: CreateConversationDto, @CurrentUser() user: User) {
    const result = await this.chatService.createConversation(user.id, dto.targetUserId);
    return ok(result, 'Conversation ready');
  }
}
