import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GuardianChatService } from './guardian-chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ok } from '../common/response.helper';

// Wali (guardian)-supervised conversations (#753).
@UseGuards(AuthGuard('jwt'))
@Controller('chat/guardian')
export class GuardianChatController {
  constructor(private service: GuardianChatService) {}

  // Ward designates a guardian to oversee their courtship conversations.
  @Post()
  async setGuardian(@CurrentUser() user: User, @Body('guardianId') guardianId: string) {
    return ok(await this.service.setGuardian(user.id, guardianId), 'تم تعيين ولي الأمر للإشراف');
  }

  @Delete()
  async removeGuardian(@CurrentUser() user: User) {
    return ok(await this.service.removeGuardian(user.id), 'تم إلغاء الإشراف');
  }

  @Get()
  async myGuardian(@CurrentUser() user: User) {
    return ok(await this.service.getMyGuardian(user.id));
  }

  // Guardian side: the wards I oversee.
  @Get('wards')
  async wards(@CurrentUser() user: User) {
    return ok(await this.service.getWards(user.id));
  }

  // Is a given user under guardian oversight (per-conversation indicator)?
  @Get('status/:userId')
  async status(@Param('userId') userId: string) {
    return ok({ supervised: await this.service.isSupervised(userId) });
  }

  // Guardian's awareness view of a ward's conversations (metadata only).
  @Get('wards/:wardId/conversations')
  async wardConversations(@CurrentUser() user: User, @Param('wardId') wardId: string) {
    return ok(await this.service.getWardConversations(user.id, wardId));
  }
}
