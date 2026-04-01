import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AffiliatesService } from '../services/affiliates.service';
import { CreateAffiliateDto } from '../dto/create-affiliate.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('affiliates')
export class AffiliatesController {
  constructor(private affiliatesService: AffiliatesService) {}

  @Get('me')
  async getMyAffiliate(@CurrentUser() user: User) {
    const affiliate = await this.affiliatesService.findByUser(user.id);
    return ok(affiliate);
  }

  @Post()
  async create(@Body() dto: CreateAffiliateDto, @CurrentUser() user: User) {
    const affiliate = await this.affiliatesService.create(user.id, dto);
    return ok(affiliate, 'Affiliate account created');
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const affiliate = await this.affiliatesService.findByReferralCode(code);
    return ok(affiliate);
  }

  // Admin endpoints
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.affiliatesService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }
}
