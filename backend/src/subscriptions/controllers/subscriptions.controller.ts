import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from '../services/subscriptions.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ok, paginated } from '../../common/response.helper';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { User } from '../../auth/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get('me')
  async getMySubscriptions(@CurrentUser() user: User) {
    const subscriptions = await this.subscriptionsService.findByUser(user.id);
    return ok(subscriptions);
  }

  @Get('me/active')
  async getMyActiveSubscription(@CurrentUser() user: User) {
    const subscription = await this.subscriptionsService.findActiveByUser(user.id);
    return ok(subscription);
  }

  @Post()
  async create(@Body() dto: CreateSubscriptionDto, @CurrentUser() user: User) {
    const subscription = await this.subscriptionsService.create(user.id, dto);
    return ok(subscription, 'Subscription created');
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    const subscription = await this.subscriptionsService.cancel(id);
    return ok(subscription, 'Subscription cancelled');
  }

  // Admin endpoints
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const { data, total } = await this.subscriptionsService.findAll(query.page!, query.limit!);
    return paginated(data, total, query.page!, query.limit!);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    const subscription = await this.subscriptionsService.update(id, dto);
    return ok(subscription, 'Subscription updated');
  }
}
