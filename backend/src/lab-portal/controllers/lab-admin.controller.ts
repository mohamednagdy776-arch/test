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
import { LabPortalService } from '../services/lab-portal.service';
import { LabStatus } from '../entities/lab.entity';
import { LabUserRole } from '../entities/lab-user.entity';

@Controller('admin/labs')
@UseGuards(AuthGuard('jwt'))
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
