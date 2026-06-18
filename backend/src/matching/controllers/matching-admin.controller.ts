import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('admin/ai')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class MatchingAdminController {
  @Get('stats')
  getStats() {
    return {
      coldStartCount: 0,
      averageScore: 72.5,
      dailySuggestions: 0,
      modelVersion: 1,
      scoreDistribution: [
        { bucket: '0-20', count: 0 },
        { bucket: '20-40', count: 0 },
        { bucket: '40-60', count: 0 },
        { bucket: '60-80', count: 0 },
        { bucket: '80-100', count: 0 },
      ],
      note: 'Connect to production database for live statistics',
    };
  }
}
