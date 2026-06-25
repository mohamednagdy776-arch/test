import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PhotoPrivacyService } from './photo-privacy.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ok } from '../common/response.helper';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class PhotoPrivacyController {
  constructor(private photoPrivacyService: PhotoPrivacyService) {}

  // Ask to view a user's private/on-request photos (#752).
  @Post('users/:id/photo-access/request')
  async request(@Param('id') ownerId: string, @CurrentUser() user: User) {
    return ok(await this.photoPrivacyService.requestAccess(user.id, ownerId), 'تم إرسال طلب رؤية الصور');
  }

  // Pending requests I (the photo owner) have received.
  @Get('photo-requests')
  async incoming(@CurrentUser() user: User) {
    return ok(await this.photoPrivacyService.getIncoming(user.id));
  }

  @Patch('photo-requests/:id')
  async respond(@Param('id') id: string, @Body('approve') approve: boolean, @CurrentUser() user: User) {
    return ok(await this.photoPrivacyService.respond(user.id, id, !!approve));
  }
}
