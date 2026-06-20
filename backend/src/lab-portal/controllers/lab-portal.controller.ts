import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../auth/entities/user.entity';
import { LabPortalService } from '../services/lab-portal.service';

@Controller('lab-portal')
export class LabPortalController {
  constructor(private service: LabPortalService) {}

  @Post('auth/login')
  async login(@Body() dto: { email: string; password: string }) {
    const result = await this.service.loginLabUser(dto.email, dto.password);
    if (!result) throw new UnauthorizedException('Invalid credentials');
    return result;
  }

  @Get('referral-code/generate')
  @UseGuards(AuthGuard('jwt'))
  async generateCode(@Request() req: any, @Query('labId') labId: string) {
    return this.service.generateReferralCode(req.user.id, labId);
  }

  @Post('results/submit')
  async submitResult(
    @Body() dto: { referralCode: string; labId: string; resultType: string },
  ) {
    return this.service.submitResult(dto.referralCode, dto.labId, dto.resultType);
  }

  @Post('scan')
  async scan(
    @Headers('x-lab-token') token: string,
    @Body() dto: { code: string },
  ) {
    if (!token) throw new UnauthorizedException('Lab token required');
    const lab = await this.service.verifyLabToken(token);
    if (!lab) throw new UnauthorizedException('Invalid or expired lab token');
    return this.service.scanAndVerify(dto.code, lab.labId);
  }

  @Get('invoices')
  @UseGuards(AuthGuard('jwt'))
  async getMyInvoices(@Query('labId') labId: string) {
    return this.service.getLabInvoices(labId);
  }

  @Get('labs')
  @UseGuards(AuthGuard('jwt'))
  async getActiveLabs() {
    return this.service.getActiveLabs();
  }

  @Get('my-referrals')
  @UseGuards(AuthGuard('jwt'))
  async getMyReferrals(@CurrentUser() user: User) {
    return this.service.getMyReferralCodes(user.id);
  }
}
