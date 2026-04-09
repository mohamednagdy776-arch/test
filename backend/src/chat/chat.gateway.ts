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

  private userSockets: Map<string, string> = new Map();

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
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
    
    const message = await this.chatService.getMessages('', '', 1, 1);
    this.server.to(`conversation:${(reaction as any).message?.conversationId}`).emit('reactionAdded', {
      messageId: payload.messageId,
      emoji: payload.emoji,
      userId: payload.userId,
    });
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
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}