import { Body, Controller, Get, Param, Post, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from '../services/chat.service';
import { SendMessageDto, EditMessageDto, DeleteMessageDto, ReactMessageDto, ForwardMessageDto, SearchMessageDto } from '../dto/message.dto';
import { CreateGroupDto, UpdateGroupDto, AddParticipantDto, RemoveParticipantDto, UpdateParticipantRoleDto } from '../dto/group.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  async getConversations(@CurrentUser() user: User) {
    const conversations = await this.chatService.getConversations(user.id);
    return ok(conversations);
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: PaginationDto,
    @CurrentUser() user: User,
  ) {
    const { data, total } = await this.chatService.getMessages(
      conversationId,
      user.id,
      query.page || 1,
      query.limit || 50,
    );
    return ok({ data, total });
  }

  @Post('messages')
  async sendMessage(@Body() dto: SendMessageDto, @CurrentUser() user: User) {
    const saved = await this.chatService.sendMessage(
      dto.conversationId,
      user.id,
      dto.content,
      dto.type,
      dto.replyToId,
      dto.mediaUrl,
    );
    return ok({
      id: saved.id,
      conversationId: dto.conversationId,
      senderId: user.id,
      content: saved.contentEncrypted,
      type: saved.type,
      createdAt: saved.createdAt,
    }, 'Message sent');
  }

  @Put('messages/:messageId')
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
    @CurrentUser() user: User,
  ) {
    const saved = await this.chatService.editMessage(messageId, user.id, dto.content);
    return ok({ id: saved.id, isEdited: saved.isEdited, editedAt: saved.editedAt }, 'Message edited');
  }

  @Delete('messages/:messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Body() dto: DeleteMessageDto,
    @CurrentUser() user: User,
  ) {
    await this.chatService.deleteMessage(messageId, user.id, dto.deleteForEveryone || false);
    return ok(null, dto.deleteForEveryone ? 'Message deleted for everyone' : 'Message deleted');
  }

  @Post('messages/:messageId/reactions')
  async reactToMessage(
    @Param('messageId') messageId: string,
    @Body() dto: ReactMessageDto,
    @CurrentUser() user: User,
  ) {
    const reaction = await this.chatService.reactToMessage(messageId, user.id, dto.emoji);
    return ok({ id: reaction.id, emoji: reaction.emoji }, 'Reaction added');
  }

  @Delete('messages/:messageId/reactions')
  async removeReaction(
    @Param('messageId') messageId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatService.removeReaction(messageId, user.id);
    return ok(null, 'Reaction removed');
  }

  @Post('messages/:messageId/star')
  async toggleStar(
    @Param('messageId') messageId: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.chatService.toggleStar(messageId, user.id);
    return ok({ isStarred: result.isStarred });
  }

  @Post('messages/:messageId/forward')
  async forwardMessage(
    @Param('messageId') messageId: string,
    @Body() dto: ForwardMessageDto,
    @CurrentUser() user: User,
  ) {
    const saved = await this.chatService.forwardMessage(messageId, user.id, dto.targetConversationId);
    return ok({ id: saved.id }, 'Message forwarded');
  }

  @Get('messages/:conversationId/search')
  async searchMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: SearchMessageDto,
    @CurrentUser() user: User,
  ) {
    const results = await this.chatService.searchMessages(conversationId, user.id, query.query);
    return ok(results);
  }

  @Post('groups')
  async createGroup(@Body() dto: CreateGroupDto, @CurrentUser() user: User) {
    const group = await this.chatService.createGroup(dto.name || 'Group', user.id, dto.participantIds);
    return ok({ id: group.id, name: group.name }, 'Group created');
  }

  @Put('groups/:conversationId')
  async updateGroup(
    @Param('conversationId') conversationId: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() user: User,
  ) {
    return ok({ id: conversationId, ...dto });
  }

  @Post('groups/:conversationId/participants')
  async addParticipant(
    @Param('conversationId') conversationId: string,
    @Body() dto: AddParticipantDto,
    @CurrentUser() user: User,
  ) {
    const participant = await this.chatService.addParticipant(conversationId, dto.userId, user.id);
    return ok(participant, 'Participant added');
  }

  @Delete('groups/:conversationId/participants/:userId')
  async removeParticipant(
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatService.removeParticipant(conversationId, userId, user.id);
    return ok(null, 'Participant removed');
  }

  @Put('groups/:conversationId/participants/:userId/role')
  async updateParticipantRole(
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateParticipantRoleDto,
    @CurrentUser() user: User,
  ) {
    await this.chatService.updateParticipantRole(conversationId, userId, dto.role, user.id);
    return ok(null, 'Role updated');
  }

  @Post('groups/:conversationId/leave')
  async leaveGroup(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatService.leaveGroup(conversationId, user.id);
    return ok(null, 'Left group');
  }

  @Post('groups/:conversationId/mute')
  async muteGroup(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatService.muteGroup(conversationId, user.id);
    return ok(null, 'Group muted');
  }

  @Post('groups/:conversationId/unmute')
  async unmuteGroup(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: User,
  ) {
    await this.chatService.unmuteGroup(conversationId, user.id);
    return ok(null, 'Group unmuted');
  }

  @Post('groups/:conversationId/disappearing')
  async toggleDisappearing(
    @Param('conversationId') conversationId: string,
    @Body() body: { enabled: boolean },
    @CurrentUser() user: User,
  ) {
    await this.chatService.toggleDisappearing(conversationId, user.id, body.enabled);
    return ok(null, 'Disappearing messages toggled');
  }

  @Get('unread')
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.chatService.getUnreadCount(user.id);
    return ok({ count });
  }
}