import { Controller, Post, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SeedService } from './seed.service';
import { Throttle } from '@nestjs/throttler';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

// Defense-in-depth: even though SeedModule is only registered outside
// production, never leave these DB-wiping endpoints unauthenticated.
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  async seedAll() {
    return this.seedService.seedAll();
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  async resetDatabase() {
    return this.seedService.resetDatabase();
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getSeedStatus() {
    return this.seedService.getSeedStatus();
  }
}