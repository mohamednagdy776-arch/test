import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LabPortalService } from '../services/lab-portal.service';

@Controller('api/v1/lab-portal')
export class LabPortalController {
  constructor(private service: LabPortalService) {}

  @Post('auth/login')
  async login(@Body() dto: { email: string; password: string }) {
    const user = await this.service.loginLabUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return { message: 'Login successful', labId: user.labId, role: user.role };
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

  @Get('invoices')
  @UseGuards(AuthGuard('jwt'))
  async getMyInvoices(@Query('labId') labId: string) {
    return this.service.getLabInvoices(labId);
  }
}
