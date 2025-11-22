import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post(':tenantId')
  @Roles('student')
  async create(
    @Param('tenantId') tenantId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.create(
      createSubscriptionDto,
      user.userId,
      tenantId,
    );
  }

  @Get(':tenantId/active')
  @Roles('student')
  async getActive(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.getActiveSubscription(user.userId, tenantId);
  }

  @Get(':tenantId/my-subscriptions')
  @Roles('student')
  async getMySubscriptions(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.getStudentSubscriptions(user.userId, tenantId);
  }

  @Get(':tenantId/all')
  @Roles('instructor', 'admin')
  async getAllSubscriptions(
    @Param('tenantId') tenantId: string,
  ) {
    return this.subscriptionsService.getTenantSubscriptions(tenantId);
  }

  @Get(':tenantId/:subscriptionId')
  @Roles('student')
  async getById(
    @Param('tenantId') tenantId: string,
    @Param('subscriptionId') subscriptionId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.getById(subscriptionId, user.userId, tenantId);
  }

  @Patch(':tenantId/:subscriptionId')
  @Roles('student')
  async update(
    @Param('tenantId') tenantId: string,
    @Param('subscriptionId') subscriptionId: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.update(
      subscriptionId,
      updateSubscriptionDto,
      user.userId,
      tenantId,
    );
  }

  @Post(':tenantId/:subscriptionId/cancel')
  @Roles('student')
  async cancel(
    @Param('tenantId') tenantId: string,
    @Param('subscriptionId') subscriptionId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.cancel(subscriptionId, user.userId, tenantId);
  }

  @Post(':tenantId/:subscriptionId/reactivate')
  @Roles('student')
  async reactivate(
    @Param('tenantId') tenantId: string,
    @Param('subscriptionId') subscriptionId: string,
    @CurrentUser() user: any,
  ) {
    return this.subscriptionsService.reactivate(subscriptionId, user.userId, tenantId);
  }

  @Get(':tenantId/check/active')
  @Roles('student')
  async checkActive(
    @Param('tenantId') tenantId: string,
    @CurrentUser() user: any,
  ) {
    const hasActive = await this.subscriptionsService.hasActiveSubscription(user.userId, tenantId);
    return { hasActiveSubscription: hasActive };
  }
}
