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
    @Query('minAge') minAge: string,
    @Query('maxAge') maxAge: string,
    @Query('gender') gender: string,
    @Query('country') country: string,
    @Query('city') city: string,
    @Query('education') education: string,
    @CurrentUser() user: User,
  ) {
    // Advanced Search lets a user apply gender/age/location/education filters
    // without typing anything in the free-text box -- this used to hard-block
    // on an empty q regardless of any filter being set, always returning zero
    // results (#245). Only short-circuit when there's truly nothing to search on.
    const hasFilters = !!(gender || minAge || maxAge || country || city || education);
    if ((!q || q.trim().length === 0) && !hasFilters) {
      return ok({
        users: [], posts: [], groups: [], pages: [], events: [], photos: [], videos: []
      });
    }
    const results = await this.searchService.search(
      q, user.id, category, this.parseAge(minAge), this.parseAge(maxAge), gender || undefined,
      country || undefined, city || undefined, education || undefined,
    );
    return ok(results);
  }

  // #24: parse an age query param, ignoring negative/out-of-range/invalid values.
  private parseAge(v?: string): number | undefined {
    const n = v != null ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n >= 18 && n <= 120 ? n : undefined;
  }

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string, @CurrentUser() user?: User) {
    if (!q || q.trim().length < 2) {
      return ok({ users: [], groups: [], pages: [], events: [] });
    }
    const results = await this.searchService.autocomplete(q, user?.id);
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