import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../auth/entities/user.entity';
import { ok } from '../common/response.helper';

// Saved searches / search alerts (#757).
@UseGuards(AuthGuard('jwt'))
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(private service: SavedSearchesService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    return ok(await this.service.list(user.id));
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateSavedSearchDto) {
    return ok(await this.service.create(user.id, dto.name, dto.filters ?? {}), 'تم حفظ البحث');
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User, @Param('id') id: string) {
    return ok(await this.service.remove(user.id, id), 'تم حذف البحث المحفوظ');
  }
}
