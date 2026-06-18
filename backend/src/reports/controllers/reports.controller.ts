import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from '../services/reports.service';
import { ContentAction } from '../entities/report.entity';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.reportsService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Patch(':id/resolve')
  async resolve(@Param('id') id: string) {
    const report = await this.reportsService.resolve(id);
    return ok(report, 'Report resolved');
  }

  @Patch(':id/dismiss')
  async dismiss(@Param('id') id: string) {
    const report = await this.reportsService.dismiss(id);
    return ok(report, 'Report dismissed');
  }

  @Patch(':id/action')
  async takeAction(
    @Param('id') id: string,
    @Body('action') action: ContentAction,
    @Body('adminNote') adminNote: string | undefined,
    @CurrentUser() user: User,
  ) {
    const report = await this.reportsService.takeAction(id, user.id, action, adminNote);
    return ok(report, 'Action taken on report');
  }
}
