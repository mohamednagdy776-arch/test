import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

export function wsAuthMiddleware(jwtService: JwtService) {
  return (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new WsException('Unauthorized') as unknown as Error);
    try {
      const payload = jwtService.verify(token, { secret: process.env.JWT_SECRET });
      socket.data.user = { id: payload.sub, role: payload.role };
      next();
    } catch {
      next(new WsException('Invalid token') as unknown as Error);
    }
  };
}
