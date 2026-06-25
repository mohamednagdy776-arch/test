import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from '../services/reports.service';
import { ok } from '../../common/response.helper';

// User-facing report routes (the main ReportsController is admin-only). The
// report-CREATE route lives on the users controller as POST /users/:id/report
// to match the spec; this exposes the reason catalog (#751).
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsPublicController {
  constructor(private reportsService: ReportsService) {}

  @Get('reasons')
  getReasons() {
    return ok(this.reportsService.getReasons());
  }
}
