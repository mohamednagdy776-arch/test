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

  constructor(private chatService: ChatService) {}

  @SubscribeMessage('joinMatch')
  handleJoin(@MessageBody() matchId: string, @ConnectedSocket() client: Socket) {
    client.join(`match:${matchId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { matchId: string; encryptedContent: string; senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const saved: any = await this.chatService.sendMessage(
      payload.matchId,
      payload.senderId,
      payload.encryptedContent,
    );
    this.server.to(`match:${payload.matchId}`).emit('newMessage', {
      id: saved.id,
      content: saved.contentEncrypted,
      senderId: payload.senderId,
      timestamp: saved.createdAt,
    });
  }
}
