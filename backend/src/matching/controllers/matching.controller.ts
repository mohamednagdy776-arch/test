import { Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MatchingService } from '../services/matching.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('matches')
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Post('generate')
  async generateMatches(@CurrentUser() user: User) {
    const matches = await this.matchingService.generateMatchesForUser(user.id);
    return ok(matches, `${matches.length} new matches generated`);
  }

  @Get()
  async getMatches(
    @CurrentUser() user: User, @Query() query: PaginationDto, @Query('status') status?: string,
    @Query('minAge') minAge?: string, @Query('maxAge') maxAge?: string,
    @Query('location') location?: string, @Query('religiousCommitment') religiousCommitment?: string,
  ) {
    const validStatuses = ['pending', 'accepted', 'rejected'];
    const statusFilter = status && validStatuses.includes(status) ? status : undefined;
    const minAgeN = minAge ? parseInt(minAge, 10) : undefined;
    const maxAgeN = maxAge ? parseInt(maxAge, 10) : undefined;
    const { data, total } = await this.matchingService.getMatches(
      user.id, query.page!, query.limit!, statusFilter, minAgeN, maxAgeN, location || undefined, religiousCommitment || undefined,
    );
    return paginated(data, total, query.page!, query.limit!);
  }

  @Get('profile/:userId')
  async getProfileWithMatch(
    @CurrentUser() user: User,
    @Param('userId') targetUserId: string,
  ) {
    const result = await this.matchingService.getProfileWithMatchScore(user.id, targetUserId);
    return ok(result);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @CurrentUser() user: User) {
    const match = await this.matchingService.getById(id, user.id);
    return ok(match);
  }

  @Patch(':id/accept')
  async accept(@Param('id') id: string, @CurrentUser() user: User) {
    const match = await this.matchingService.respondToMatch(id, user.id, 'accepted');
    return ok(match, 'Match accepted');
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @CurrentUser() user: User) {
    const match = await this.matchingService.respondToMatch(id, user.id, 'rejected');
    return ok(match, 'Match rejected');
  }

  // The web "تراجع عن الرفض" (Undo Reject) button had no dedicated endpoint
  // and reused /accept, which set the match straight to Accepted instead of
  // back to its default Pending state (#137).
  @Patch(':id/undo-reject')
  async undoReject(@Param('id') id: string, @CurrentUser() user: User) {
    const match = await this.matchingService.undoReject(id, user.id);
    return ok(match, 'Match restored to pending');
  }

  // "Undo Accept" was missing entirely, unlike "Undo Reject" (#362).
  @Patch(':id/undo-accept')
  async undoAccept(@Param('id') id: string, @CurrentUser() user: User) {
    const match = await this.matchingService.undoAccept(id, user.id);
    return ok(match, 'Match restored to pending');
  }
}
