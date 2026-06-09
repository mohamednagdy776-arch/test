import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './services/chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // userId -> set of socket ids (supports multiple tabs/devices)
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private chatService: ChatService) {}

  private isOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    const wasOffline = this.userSockets.get(userId)!.size === 0;
    this.userSockets.get(userId)!.add(client.id);
    if (wasOffline) {
      this.server.emit('presence', { userId, online: true });
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, set] of this.userSockets.entries()) {
      if (set.has(client.id)) {
        set.delete(client.id);
        if (set.size === 0) {
          this.userSockets.delete(userId);
          this.server.emit('presence', { userId, online: false });
        }
        break;
      }
    }
  }

  /** Client asks whether a given user is currently online (ack response). */
  @SubscribeMessage('getPresence')
  handleGetPresence(@MessageBody() payload: { userId: string }) {
    return { userId: payload.userId, online: this.isOnline(payload.userId) };
  }

  @SubscribeMessage('joinConversation')
  handleJoin(
    @MessageBody() payload: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation:${payload.conversationId}`);
  }

  @SubscribeMessage('leaveConversation')
  handleLeave(
    @MessageBody() payload: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation:${payload.conversationId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: {
      conversationId: string;
      senderId: string;
      content: string;
      type?: string;
      replyToId?: string;
      mediaUrl?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const saved: any = await this.chatService.sendMessage(
      payload.conversationId,
      payload.senderId,
      payload.content,
      payload.type,
      payload.replyToId,
      payload.mediaUrl,
    );

    const message = {
      id: saved.id,
      conversationId: payload.conversationId,
      content: saved.contentEncrypted,
      type: saved.type,
      senderId: payload.senderId,
      replyToId: saved.replyToId,
      mediaUrl: saved.mediaUrl,
      createdAt: saved.createdAt,
    };

    this.server.to(`conversation:${payload.conversationId}`).emit('newMessage', message);

    return message;
  }

  /**
   * Broadcast an already-persisted message to the OTHER participants.
   * The REST endpoint (POST /chat/messages) is the single source of truth for
   * persistence; this only relays in real time and uses `client.to` so the
   * sender never receives a duplicate of their own message.
   */
  @SubscribeMessage('relayMessage')
  handleRelay(
    @MessageBody() payload: { conversationId: string; message: any },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`conversation:${payload.conversationId}`).emit('newMessage', {
      ...payload.message,
      conversationId: payload.conversationId,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() payload: { conversationId: string; userId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`conversation:${payload.conversationId}`).emit('userTyping', {
      conversationId: payload.conversationId,
      userId: payload.userId,
      isTyping: payload.isTyping,
    });
  }

  @SubscribeMessage('markSeen')
  async handleMarkSeen(
    @MessageBody() payload: { conversationId: string; userId: string; messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`conversation:${payload.conversationId}`).emit('messageSeen', {
      conversationId: payload.conversationId,
      userId: payload.userId,
      messageId: payload.messageId,
      seenAt: new Date(),
    });
  }

  @SubscribeMessage('addReaction')
  async handleReaction(
    @MessageBody() payload: { messageId: string; userId: string; emoji: string },
    @ConnectedSocket() client: Socket,
  ) {
    const reaction: any = await this.chatService.reactToMessage(payload.messageId, payload.userId, payload.emoji);
    
    const conversationId = (reaction as any).message?.conversation?.id;
    if (conversationId) {
      this.server.to(`conversation:${conversationId}`).emit('reactionAdded', {
        messageId: payload.messageId,
        emoji: payload.emoji,
        userId: payload.userId,
      });
    }
  }

  @SubscribeMessage('removeReaction')
  async handleRemoveReaction(
    @MessageBody() payload: { messageId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.removeReaction(payload.messageId, payload.userId);
    this.server.emit('reactionRemoved', {
      messageId: payload.messageId,
      userId: payload.userId,
    });
  }

  emitToUser(userId: string, event: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }
}