import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SavedService } from '../services/saved.service';
import { SaveItemDto } from '../dto/save-item.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('saved')
export class SavedController {
  constructor(private savedService: SavedService) {}

  @Get()
  async getSaved(@CurrentUser() user: User) {
    const saved = await this.savedService.getSaved(user.id);
    return ok(saved);
  }

  @Post()
  async save(@CurrentUser() user: User, @Body() dto: SaveItemDto) {
    const saved = await this.savedService.save(user.id, dto.entityType, dto.entityId);
    return ok(saved, 'Item saved');
  }

  @Delete(':id')
  async unsave(@CurrentUser() user: User, @Param('id') id: string) {
    await this.savedService.unsave(user.id, id);
    return ok(null, 'Item removed from saved');
  }
}