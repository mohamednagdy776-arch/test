import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InterestsService } from './interests.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ok, paginated } from '../common/response.helper';
import { PaginationDto } from '../common/dto/pagination.dto';

// Routes live under /users to match the spec (#754). Separate controller keeps
// the interest/profile-view concern out of the already-large UsersController.
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class InterestsController {
  constructor(private interestsService: InterestsService) {}

  @Get('me/interests/received')
  async received(@CurrentUser() user: User) {
    return ok(await this.interestsService.getReceived(user.id));
  }

  @Get('me/interests/sent')
  async sent(@CurrentUser() user: User) {
    return ok(await this.interestsService.getSent(user.id));
  }

  @Get('me/profile-views')
  async profileViews(@CurrentUser() user: User, @Query() query: PaginationDto) {
    const { data, total } = await this.interestsService.getProfileViews(user.id, query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  // "Send Salam" — directed marriage-intent interest (#754).
  @Post(':id/interest')
  async sendInterest(@Param('id') id: string, @CurrentUser() user: User) {
    const receiverId = await this.interestsService.resolveUserId(id);
    if (!receiverId) throw new NotFoundException('User not found');
    const result = await this.interestsService.sendInterest(user.id, receiverId);
    return ok(result, result.mutual ? 'اهتمام متبادل! 🎉' : 'تم إرسال اهتمامك');
  }

  @Delete(':id/interest')
  async withdrawInterest(@Param('id') id: string, @CurrentUser() user: User) {
    const receiverId = await this.interestsService.resolveUserId(id);
    if (!receiverId) throw new NotFoundException('User not found');
    return ok(await this.interestsService.withdraw(user.id, receiverId), 'تم سحب الاهتمام');
  }
}
