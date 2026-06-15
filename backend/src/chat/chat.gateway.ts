import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ChatService } from './services/chat.service';
import { FriendsService } from '../friends/services/friends.service';
import { readCookie } from '../auth/cookie.util';

@WebSocketGateway({
  // Restrict WS origins like the REST API (was '*'). Same-origin in prod.
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // userId -> set of socket ids (supports multiple tabs/devices)
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private friendsService: FriendsService,
  ) {}

  private isOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  // Broadcast a user's presence ONLY to their friends' connected sockets, not to
  // every client on the platform (#148). Fire-and-forget from the connect/
  // disconnect handlers.
  private async emitPresenceToFriends(userId: string, online: boolean) {
    try {
      const friendIds = await this.friendsService.getFriendIds(userId);
      for (const friendId of friendIds) {
        const sockets = this.userSockets.get(friendId);
        if (!sockets) continue;
        for (const socketId of sockets) {
          this.server.to(socketId).emit('presence', { userId, online });
        }
      }
    } catch {
      // Presence is best-effort; never let it crash the socket lifecycle.
    }
  }

  handleConnection(client: Socket) {
    // Authenticate the socket. The client sends its JWT in handshake.auth.token
    // (see web/src/lib/socket-client.ts). Reject anyone without a valid token
    // instead of trusting a client-supplied userId — previously any anonymous
    // client could connect, join rooms, and read/send messages.
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.query?.token as string) ||
      readCookie(client.handshake.headers?.cookie, 'access_token');
    if (!token) {
      client.disconnect(true);
      return;
    }
    let userId: string;
    try {
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      userId = payload?.sub;
    } catch {
      client.disconnect(true);
      return;
    }
    if (!userId) {
      client.disconnect(true);
      return;
    }
    client.data.userId = userId;
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    const wasOffline = this.userSockets.get(userId)!.size === 0;
    this.userSockets.get(userId)!.add(client.id);
    if (wasOffline) {
      void this.emitPresenceToFriends(userId, true);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, set] of this.userSockets.entries()) {
      if (set.has(client.id)) {
        set.delete(client.id);
        if (set.size === 0) {
          this.userSockets.delete(userId);
          void this.emitPresenceToFriends(userId, false);
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
  async handleJoin(
    @MessageBody() payload: { conversationId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Only join the room if the authenticated user is a participant — otherwise
    // anyone could join any conversation room and receive its messages.
    if (!(await this.chatService.isParticipant(payload.conversationId, client.data.userId))) {
      return;
    }
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
    // Use the server-verified user id, never the client-supplied senderId
    // (which allowed impersonating any user). Also require participation.
    const senderId: string = client.data.userId;
    if (!senderId || !(await this.chatService.isParticipant(payload.conversationId, senderId))) {
      return;
    }
    const saved: any = await this.chatService.sendMessage(
      payload.conversationId,
      senderId,
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
      senderId,
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