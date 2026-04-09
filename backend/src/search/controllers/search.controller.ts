import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from '../services/search.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q: string,
    @Query('category') category: string,
    @CurrentUser() user: User,
  ) {
    if (!q || q.trim().length === 0) {
      return ok({
        users: [], posts: [], groups: [], pages: [], events: [], photos: [], videos: []
      });
    }
    const results = await this.searchService.search(q, user.id, category);
    return ok(results);
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string) {
    if (!q || q.trim().length < 2) {
      return ok({ users: [], groups: [], pages: [], events: [] });
    }
    const results = await this.searchService.autocomplete(q);
    return ok(results);
  }

  @Get('location')
  async searchByLocation(
    @Query('q') q: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    const coordinates = lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined;
    const results = await this.searchService.searchByLocation(q, coordinates);
    return ok(results);
  }
}