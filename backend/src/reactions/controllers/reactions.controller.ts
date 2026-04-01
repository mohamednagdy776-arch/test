import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReactionsService } from '../services/reactions.service';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('posts/:postId/reactions')
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Post()
  async react(
    @Param('postId') postId: string,
    @Body() dto: CreateReactionDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.reactionsService.react(postId, dto, user);
    return ok(result, result.reacted ? 'Reaction added' : 'Reaction removed');
  }

  @Get()
  async findAll(@Param('postId') postId: string) {
    const result = await this.reactionsService.findByPost(postId);
    return ok(result);
  }

  @Get('me')
  async getMyReaction(@Param('postId') postId: string, @CurrentUser() user: User) {
    const reaction = await this.reactionsService.getUserReaction(postId, user.id);
    return ok(reaction);
  }
}
