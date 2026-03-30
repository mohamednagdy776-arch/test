import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Real-time chat via WebSocket
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinMatch')
  handleJoin(@MessageBody() matchId: string, @ConnectedSocket() client: Socket) {
    client.join(`match:${matchId}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() payload: { matchId: string; encryptedContent: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast encrypted message to match room only
    // TODO: persist via ChatService before emitting
    this.server.to(`match:${payload.matchId}`).emit('newMessage', {
      content: payload.encryptedContent,
      timestamp: new Date(),
    });
  }
}
