import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RedisCacheService } from './services/redis-cache.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [RedisCacheService, WsJwtGuard],
  exports: [RedisCacheService, WsJwtGuard, JwtModule],
})
export class CommonModule {}
