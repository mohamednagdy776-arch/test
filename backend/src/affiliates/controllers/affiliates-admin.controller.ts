import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AffiliatesService } from '../services/affiliates.service';

@Controller('api/v1/admin/affiliates')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class AffiliatesAdminController {
  constructor(private affiliatesService: AffiliatesService) {}

  @Get()
  async getAll() {
    const { data } = await this.affiliatesService.findAll(1, 1000);
    return data.map(a => ({
      id: a.id,
      code: a.referralCode,
      type: 'standard',
      status: 'active',
      totalReferrals: a.totalReferred ?? 0,
      totalEarnings: Number(a.commissionBalance ?? 0),
      isFlagged: false,
    }));
  }
}
