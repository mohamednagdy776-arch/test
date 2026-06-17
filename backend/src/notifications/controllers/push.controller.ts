import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { PushService } from '../services/push.service';
import { ok } from '../../common/response.helper';

class SubscribeDto {
  endpoint: string;
  p256dh: string;
  authKey: string;
}

@UseGuards(AuthGuard('jwt'))
@Controller('push')
export class PushController {
  constructor(private pushService: PushService) {}

  @Get('vapid-public-key')
  getPublicKey() {
    return ok({ publicKey: this.pushService.getVapidPublicKey() });
  }

  @Post('subscribe')
  async subscribe(@CurrentUser() user: User, @Body() dto: SubscribeDto) {
    await this.pushService.subscribe(user.id, dto.endpoint, dto.p256dh, dto.authKey);
    return ok(null, 'Subscribed to push notifications');
  }

  @Delete('unsubscribe')
  async unsubscribe(@CurrentUser() user: User, @Body() body: { endpoint: string }) {
    await this.pushService.unsubscribe(user.id, body.endpoint);
    return ok(null, 'Unsubscribed');
  }
}
