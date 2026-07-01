import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from '../services/reports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok } from '../../common/response.helper';
import { User } from '../../auth/entities/user.entity';
import { CreateReportDto } from '../dto/create-report.dto';

// User-facing report routes (the main ReportsController is admin-only). Exposes
// the reason catalog plus a generic content-report endpoint.
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsPublicController {
  constructor(private reportsService: ReportsService) {}

  @Get('reasons')
  getReasons() {
    return ok(this.reportsService.getReasons());
  }

  // Generic report endpoint for any content type (video/post/comment/...). The
  // web app posts here for video reports; it previously 404'd because the only
  // create route was POST /users/:id/report (users only) (#79).
  @Post()
  async create(@Body() dto: CreateReportDto, @CurrentUser() user: User) {
    await this.reportsService.createReport(user.id, dto.entityType, dto.entityId, dto.reason, dto.details);
    return ok(null, 'تم استلام بلاغك، وسيقوم فريقنا بمراجعته');
  }
}
