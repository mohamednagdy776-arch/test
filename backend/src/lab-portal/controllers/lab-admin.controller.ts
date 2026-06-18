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

@Controller('api/v1/admin/labs')
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
}
