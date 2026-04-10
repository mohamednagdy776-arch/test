import { Controller, Post, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Throttle } from '@nestjs/throttler';

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