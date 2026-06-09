import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { ConversationParticipant } from '../entities/conversation-participant.entity';
import { MessageReaction } from '../entities/message-reaction.entity';
import { User } from '../../auth/entities/user.entity';
import { Profile } from '../../users/entities/profile.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    @InjectRepository(Conversation) private conversationRepo: Repository<Conversation>,
    @InjectRepository(ConversationParticipant) private participantRepo: Repository<ConversationParticipant>,
    @InjectRepository(MessageReaction) private reactionRepo: Repository<MessageReaction>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Profile) private profilesRepo: Repository<Profile>,
  ) {}

  /**
   * Resolve display info for the "other" participant of a 1:1 conversation.
   * NOTE: the ConversationParticipant relations cannot be used because the
   * join columns (user_id/conversation_id) are unpopulated in the current
   * schema — we rely on the scalar userId/conversationId columns instead.
   */
  private async resolveOtherUser(conversationId: string, userId: string) {
    const parts = await this.participantRepo.find({ where: { conversationId } });
    const other = parts.find(p => p.userId !== userId);
    if (!other) return null;
    const user = await this.usersRepo.findOne({ where: { id: other.userId } });
    if (!user) return { id: other.userId, name: null, avatar: null };
    const profile = await this.profilesRepo.findOne({ where: { user: { id: user.id } } });
    const name =
      `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
      profile?.fullName || user.fullName || null;
    return { id: user.id, name, avatar: profile?.avatarUrl ?? null };
  }

  private buildConversationDto(
    conv: Conversation,
    userId: string,
    other: { id: string; name: string | null; avatar: string | null } | null,
  ) {
    const lastMessage = conv.messages?.length ? conv.messages[conv.messages.length - 1] : null;
    return {
      id: conv.id,
      name: conv.isGroup ? conv.name : (other?.name || 'محادثة'),
      avatar: conv.isGroup ? conv.avatar : (other?.avatar ?? null),
      isGroup: conv.isGroup,
      otherUserId: other?.id ?? null,
      otherUserName: other?.name ?? null,
      otherUserAvatar: other?.avatar ?? null,
      lastMessage: lastMessage ? {
        content: lastMessage.contentEncrypted,
        createdAt: lastMessage.createdAt,
      } : null,
      createdAt: conv.createdAt,
    };
  }

  async getConversations(userId: string) {
    // Use scalar columns (relations on ConversationParticipant join on
    // unpopulated FK columns in the current schema).
    const myParts = await this.participantRepo.find({ where: { userId } });
    const convIds = myParts.map(p => p.conversationId);
    if (convIds.length === 0) return [];

    const conversations = await this.conversationRepo.find({
      where: { id: In(convIds) },
      relations: ['messages'],
    });

    const sorted = conversations.sort((a, b) => {
      const aMsg = a.messages?.[a.messages.length - 1]?.createdAt ?? a.createdAt;
      const bMsg = b.messages?.[b.messages.length - 1]?.createdAt ?? b.createdAt;
      return new Date(bMsg).getTime() - new Date(aMsg).getTime();
    });

    const out = [];
    for (const conv of sorted) {
      const other = conv.isGroup ? null : await this.resolveOtherUser(conv.id, userId);
      out.push(this.buildConversationDto(conv, userId, other));
    }
    return out;
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
      .orderBy('message.createdAt', 'ASC')
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
    const msg = await this.messagesRepo.findOne({ where: { id: messageId }, relations: ['sender'] });
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
    const msg = await this.messagesRepo.findOne({ where: { id: messageId }, relations: ['sender'] });
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
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get the existing 1:1 conversation between two users, or create one.
   * Used by POST /chat/conversations so that direct messaging works without
   * pre-existing group membership (fixes "GET messages → 403").
   */
  async getOrCreateDirectConversation(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new ForbiddenException('Cannot start a conversation with yourself');
    }

    // Find an existing 1:1 conversation containing both users (scalar columns).
    const mine = await this.participantRepo.find({ where: { userId } });
    const myConvIds = mine.map(p => p.conversationId);

    if (myConvIds.length > 0) {
      const sharedParts = await this.participantRepo.find({
        where: { userId: targetUserId, conversationId: In(myConvIds) },
      });
      for (const sp of sharedParts) {
        const conv = await this.conversationRepo.findOne({
          where: { id: sp.conversationId },
          relations: ['messages'],
        });
        if (conv && !conv.isGroup) {
          const other = await this.resolveOtherUser(conv.id, userId);
          return this.buildConversationDto(conv, userId, other);
        }
      }
    }

    // None exists → create a fresh 1:1 conversation.
    const conversation = await this.conversationRepo.save(
      this.conversationRepo.create({ isGroup: false, createdBy: { id: userId } as any }),
    );
    await this.participantRepo.save([
      { conversationId: conversation.id, userId, role: 'member' as any },
      { conversationId: conversation.id, userId: targetUserId, role: 'member' as any },
    ]);

    const conv = await this.conversationRepo.findOne({
      where: { id: conversation.id },
      relations: ['messages'],
    }) as Conversation;
    const other = await this.resolveOtherUser(conversation.id, userId);
    return this.buildConversationDto(conv, userId, other);
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