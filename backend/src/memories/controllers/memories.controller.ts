import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemoryService } from '../services/memory.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('memories')
export class MemoriesController {
  constructor(private memoryService: MemoryService) {}

  @Get()
  async getMemories(@CurrentUser() user: User) {
    const memories = await this.memoryService.getMemories(user.id);
    return ok(memories);
  }
}