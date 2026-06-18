import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConsentService } from '../services/consent.service';
import { CreateConsentRequestDto } from '../dto/create-consent-request.dto';
import { RespondConsentDto } from '../dto/respond-consent.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post('request')
  async requestConsent(@Body() dto: CreateConsentRequestDto, @Req() req: any) {
    const ip: string =
      (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req?.ip ||
      '0.0.0.0';
    return this.consentService.requestConsent(
      req.user.id,
      dto.targetUserId,
      dto.consentType,
      ip,
    );
  }

  @Post(':id/respond')
  async respondToConsent(
    @Param('id') id: string,
    @Body() dto: RespondConsentDto,
    @Req() req: any,
  ) {
    const ip: string =
      (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req?.ip ||
      '0.0.0.0';
    return this.consentService.respondToConsent(id, req.user.id, dto.accept, ip);
  }

  @Post(':id/revoke')
  async revokeConsent(@Param('id') id: string, @Req() req: any) {
    const ip: string =
      (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req?.ip ||
      '0.0.0.0';
    return this.consentService.revokeConsent(id, req.user.id, ip);
  }

  @Get('my')
  async getMyConsents(@Req() req: any) {
    return this.consentService.getMyConsentRequests(req.user.id);
  }
}
