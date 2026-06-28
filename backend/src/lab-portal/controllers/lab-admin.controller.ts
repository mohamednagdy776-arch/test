import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { LabPortalService } from '../services/lab-portal.service';
import { LabStatus } from '../entities/lab.entity';
import { LabUserRole } from '../entities/lab-user.entity';

// Admin-only — every route here manages labs/lab-users/invoices. Was previously
// guarded by jwt ONLY, letting any authenticated user manage labs (#812).
@Controller('admin/labs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class LabAdminController {
  constructor(private service: LabPortalService) {}

  @Get()
  async getAllLabs() {
    return this.service.getAllLabs();
  }

  @Post()
  async createLab(
    @Body() dto: { name: string; commercialRegistration: string },
  ) {
    return this.service.createLab(dto.name, dto.commercialRegistration);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: LabStatus,
  ) {
    return this.service.updateLabStatus(id, status);
  }

  @Get(':id/invoices')
  async getLabInvoices(@Param('id') id: string) {
    return this.service.getAllInvoicesForLab(id);
  }

  @Post(':id/users')
  async createLabUser(
    @Param('id') labId: string,
    @Body() dto: { email: string; password: string; role?: LabUserRole },
  ) {
    return this.service.createLabUser(labId, dto.email, dto.password, dto.role ?? LabUserRole.LAB_TECHNICIAN);
  }
}
