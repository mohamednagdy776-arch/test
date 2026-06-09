import { Body, Controller, Delete, Get, Param, Post, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SavedService } from '../services/saved.service';
import { SaveItemDto, CreateCollectionDto, UpdateCollectionDto } from '../dto/save-item.dto';
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
    const saved = await this.savedService.save(user.id, dto.entityType, dto.entityId, dto.collectionId);
    return ok(saved, 'Item saved');
  }

  @Delete(':id')
  async unsave(@CurrentUser() user: User, @Param('id') id: string) {
    await this.savedService.unsave(user.id, id);
    return ok(null, 'Item removed from saved');
  }

  // Collections
  @Get('collections')
  async getCollections(@CurrentUser() user: User) {
    const collections = await this.savedService.getCollections(user.id);
    return ok(collections);
  }

  @Post('collections')
  async createCollection(@CurrentUser() user: User, @Body() dto: CreateCollectionDto) {
    const collection = await this.savedService.createCollection(user.id, dto.name, dto.coverImage);
    return ok(collection, 'Collection created');
  }

  @Patch('collections/:id')
  async updateCollection(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: UpdateCollectionDto) {
    const collection = await this.savedService.updateCollection(user.id, id, dto.name, dto.coverImage);
    return ok(collection, 'Collection updated');
  }

  @Delete('collections/:id')
  async deleteCollection(@CurrentUser() user: User, @Param('id') id: string) {
    await this.savedService.deleteCollection(user.id, id);
    return ok(null, 'Collection deleted');
  }

  @Get('collections/:id')
  async getCollectionItems(@CurrentUser() user: User, @Param('id') id: string) {
    const items = await this.savedService.getCollectionItems(user.id, id);
    return ok(items);
  }
}