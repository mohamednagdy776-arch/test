import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation-participant.entity';
import { MessageReaction } from '../entities/message-reaction.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(MessageReaction) private reactionRepo: Repository<MessageReaction>,
  ) {}

  async getConversations(userId: string) {
    const participants = await this.participantRepo.find({
      where: { userId },
      relations: ['conversation', 'conversation.messages', 'conversation.participants'],
    });

    const conversations = participants.map(p => p.conversation);
    const sorted = conversations.sort((a, b) => {
      const aMsg = a.messages?.[a.messages.length - 1]?.createdAt;
      const bMsg = b.messages?.[b.messages.length - 1]?.createdAt;
      return new Date(bMsg).getTime() - new Date(aMsg).getTime();
    });

    return sorted.map(conv => this.formatConversation(conv, userId));
  }

  private formatConversation(conv: Conversation, userId: string) {
    const lastMessage = conv.messages?.[conv.messages.length - 1];
    return {
      id: conv.id,
      name: conv.name,
      avatar: conv.avatar,
      isGroup: conv.isGroup,
      lastMessage: lastMessage ? {
        content: lastMessage.contentEncrypted,
        createdAt: lastMessage.createdAt,
        senderId: lastMessage.sender?.id,
      } : null,
      createdAt: conv.createdAt,
    };
  }

  async getMessages(conversationId: string, userId: string, page: number = 1, limit: number = 50) {
    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    const [messages, total] = await this.messagesRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'profile')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('reactions.user', 'reactionUser')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.deleted_at IS NULL')
      .orderBy('message.created_at', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: messages.map(m => ({
        id: m.id,
        content: m.isDeletedForEveryone ? null : m.contentEncrypted,
        senderId: m.sender?.id,
        senderName: m.sender?.profile?.fullName || null,
        type: m.type,
        mediaUrl: m.mediaUrl,
        replyToId: m.replyToId,
        isEdited: m.isEdited,
        editedAt: m.editedAt,
        isDeletedForEveryone: m.isDeletedForEveryone,
        isStarred: m.isStarred,
        reactions: m.reactions?.map(r => ({ emoji: r.emoji, userId: r.user?.id })),
        createdAt: m.createdAt,
      })),
      total,
    };
  }

  async sendMessage(conversationId: string, senderId: string, content: string, type: string = 'text', replyToId?: string, mediaUrl?: string): Promise<Message> {
    const msg = this.messagesRepo.create({
      conversation: { id: conversationId } as any,
      sender: { id: senderId } as any,
      contentEncrypted: content,
      type: type as any,
      replyToId,
      mediaUrl,
    });
    return this.messagesRepo.save(msg);
  }

  async editMessage(messageId: string, userId: string, content: string) {
    const msg = await this.messagesRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.sender?.id !== userId) throw new ForbiddenException('Not your message');

    const editTime = new Date(msg.createdAt).getTime() + 15 * 60 * 1000;
    if (Date.now() > editTime) throw new ForbiddenException('Edit window expired');

    msg.contentEncrypted = content;
    msg.isEdited = true;
    msg.editedAt = new Date();
    return this.messagesRepo.save(msg);
  }

  async deleteMessage(messageId: string, userId: string, deleteForEveryone: boolean = false) {
    const msg = await this.messagesRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    if (deleteForEveryone) {
      if (msg.sender?.id !== userId) throw new ForbiddenException('Can only delete your own messages');
      msg.isDeletedForEveryone = true;
      msg.contentEncrypted = '';
      return this.messagesRepo.save(msg);
    } else {
      msg.deletedAt = new Date();
      return this.messagesRepo.save(msg);
    }
  }

  async reactToMessage(messageId: string, userId: string, emoji: string) {
    const existing = await this.reactionRepo.findOne({
      where: { message: { id: messageId }, user: { id: userId } },
      relations: ['message'],
    });
    if (existing) {
      existing.emoji = emoji;
      return this.reactionRepo.save(existing);
    }
    const reaction = this.reactionRepo.create({
      message: { id: messageId } as any,
      user: { id: userId } as any,
      emoji,
    });
    const saved = await this.reactionRepo.save(reaction);
    return this.reactionRepo.findOne({
      where: { id: saved.id },
      relations: ['message'],
    });
  }

  async removeReaction(messageId: string, userId: string) {
    await this.reactionRepo.delete({ message: { id: messageId }, user: { id: userId } });
  }

  async toggleStar(messageId: string, userId: string) {
    const msg = await this.messagesRepo.findOne({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');
    msg.isStarred = !msg.isStarred;
    return this.messagesRepo.save(msg);
  }

  async forwardMessage(messageId: string, userId: string, targetConversationId: string) {
    const original = await this.messagesRepo.findOne({ where: { id: messageId } });
    if (!original) throw new NotFoundException('Message not found');

    const participant = await this.participantRepo.findOne({
      where: { conversationId: targetConversationId, userId },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    const forwarded = this.messagesRepo.create({
      conversation: { id: targetConversationId } as any,
      sender: { id: userId } as any,
      contentEncrypted: original.contentEncrypted,
      type: original.type,
    });
    return this.messagesRepo.save(forwarded);
  }

  async searchMessages(conversationId: string, userId: string, query: string) {
    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (!participant) throw new ForbiddenException('Not a participant');

    return this.messagesRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.profile', 'profile')
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.content_encrypted ILIKE :query', { query: `%${query}%` })
      .andWhere('message.deleted_at IS NULL')
      .orderBy('message.created_at', 'DESC')
      .getMany();
  }

  async createGroup(name: string, createdBy: string, participantIds: string[]): Promise<Conversation> {
    const conversation = this.conversationRepo.create({
      name,
      isGroup: true,
      createdBy: { id: createdBy } as any,
    });
    const saved = await this.conversationRepo.save(conversation);

    const participants = [
      { conversationId: saved.id, userId: createdBy, role: 'creator' as any },
      ...participantIds.map(id => ({ conversationId: saved.id, userId: id, role: 'member' as any })),
    ];
    await this.participantRepo.save(participants);

    return saved;
  }

  async addParticipant(conversationId: string, userId: string, addedBy: string) {
    const conv = await this.conversationRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Conversation not found');

    const admin = await this.participantRepo.findOne({
      where: { conversationId, userId: addedBy, role: In(['admin', 'creator']) },
    });
    if (!admin) throw new ForbiddenException('Only admins can add members');

    const existing = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (existing) throw new ForbiddenException('Already a participant');

    const participant = this.participantRepo.create({
      conversationId,
      userId,
      role: 'member' as any,
    });
    return this.participantRepo.save(participant);
  }

  async removeParticipant(conversationId: string, userId: string, removedBy: string) {
    const admin = await this.participantRepo.findOne({
      where: { conversationId, userId: removedBy, role: In(['admin', 'creator']) },
    });
    if (!admin) throw new ForbiddenException('Only admins can remove members');

    await this.participantRepo.delete({ conversationId, userId });
  }

  async updateParticipantRole(conversationId: string, userId: string, role: string, updatedBy: string) {
    const admin = await this.participantRepo.findOne({
      where: { conversationId, userId: updatedBy, role: 'creator' as any },
    });
    if (!admin) throw new ForbiddenException('Only creator can assign admins');

    await this.participantRepo.update({ conversationId, userId }, { role: role as any, isAdmin: role === 'admin' });
  }

  async leaveGroup(conversationId: string, userId: string) {
    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (!participant) throw new NotFoundException('Not a participant');

    if (participant.role === 'creator') throw new ForbiddenException('Creator cannot leave, transfer ownership first');
    await this.participantRepo.delete({ conversationId, userId });
  }

  async muteGroup(conversationId: string, userId: string, duration?: number) {
    await this.participantRepo.update({ conversationId, userId }, { isMuted: true });
  }

  async unmuteGroup(conversationId: string, userId: string) {
    await this.participantRepo.update({ conversationId, userId }, { isMuted: false });
  }

  async toggleDisappearing(conversationId: string, userId: string, enabled: boolean = true) {
    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (!participant || !participant.isAdmin) throw new ForbiddenException('Only admins can toggle disappearing messages');

    await this.conversationRepo.update({ id: conversationId }, { disappearingMode: enabled });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return 0;
  }
}