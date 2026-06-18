import { Body, Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from '../services/payments.service';
import { WebhookService } from '../services/webhook.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private webhookService: WebhookService,
  ) {}

  @Get()
  async findAll(@Query() query: PaginationDto, @Req() req: any) {
    const { data, total } = await this.paymentsService.findAll(query.page!, query.limit!, req.user?.id);
    return paginated(data, total, query.page!, query.limit!);
  }

  @Post('api/v1/webhooks/payments')
  @UseGuards()
  async handleWebhook(
    @Body() body: { provider: string; eventId: string; eventType: string; payload: any },
  ) {
    return this.webhookService.handlePaymentEvent(
      body.provider,
      body.eventId,
      body.eventType,
      body.payload,
    );
  }
}
