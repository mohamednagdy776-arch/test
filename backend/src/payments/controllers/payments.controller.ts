import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from '../services/payments.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.paymentsService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }
}
