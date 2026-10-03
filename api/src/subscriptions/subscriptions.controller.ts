import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CheckoutSubscriptionDto,
  ValidateCodeDto,
  SimulatePaymentDto,
  GrantSubscriptionDto,
  CreatePlanDto,
  UpdatePlanDto,
  UpdateUserSubscriptionDto,
} from './dto/subscription.dto';
import { SubscriptionStatus } from '@prisma/client';

@ApiTags('Obunalar va Toʻlovlar (Subscriptions & Billing)')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Mavjud barcha faol tariflar roʻyxati' })
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('my-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Foydalanuvchining joriy obuna holati va doʻkon vaucherlari',
  })
  async getMySubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.getMySubscription(userId);
  }

  @Post('validate-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Promokod yoki doʻkon vaucherini tekshirish' })
  async validateCode(
    @CurrentUser('id') userId: string,
    @Body() dto: ValidateCodeDto,
  ) {
    return this.subscriptionsService.validateDiscountCode(userId, dto);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Toʻlov tranzaksiyasini ochish (Checkout boshlash)',
  })
  async checkout(
    @CurrentUser('id') userId: string,
    @Body() dto: CheckoutSubscriptionDto,
  ) {
    return this.subscriptionsService.initiateCheckout(userId, dto);
  }

  @Post('simulate-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Demo/Test rejimida toʻlovni tasdiqlash' })
  async simulatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: SimulatePaymentDto,
  ) {
    return this.subscriptionsService.simulatePayment(userId, dto.transactionId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obuna avto-yangilanishini toʻxtatish' })
  async cancelSubscription(@CurrentUser('id') userId: string) {
    return this.subscriptionsService.cancelSubscription(userId);
  }
}

@ApiTags('Admin Panel - Obunalar (Admin Subscriptions)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/subscriptions')
export class AdminSubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha obunalarni koʻrish va filterlash' })
  async getSubscriptions(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: SubscriptionStatus,
  ) {
    return this.subscriptionsService.adminGetSubscriptions(
      parseInt(page, 10),
      parseInt(limit, 10),
      status,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obunalar boʻyicha tushum va aʼzolar statistikasi' })
  async getStats() {
    return this.subscriptionsService.adminGetStats();
  }

  @Post('grant')
  @ApiOperation({ summary: 'Foydalanuvchiga qoʻlda VIP Pro taqdim etish' })
  async grantSubscription(@Body() dto: GrantSubscriptionDto) {
    return this.subscriptionsService.adminGrantSubscription(dto);
  }

  // === PLAN CRUD ENDPOINTS ===
  @Get('plans')
  @ApiOperation({
    summary: 'Barcha tariflarni boshqaruv uchun olish (faol va nofaol)',
  })
  async getAdminPlans() {
    return this.subscriptionsService.adminGetAllPlans();
  }

  @Post('plans')
  @ApiOperation({ summary: 'Yangi tarif yaratish' })
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.subscriptionsService.adminCreatePlan(dto);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Tarifni tahrirlash' })
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.subscriptionsService.adminUpdatePlan(id, dto);
  }

  @Delete('plans/:id')
  @ApiOperation({ summary: 'Tarifni oʻchirish' })
  async deletePlan(@Param('id') id: string) {
    return this.subscriptionsService.adminDeletePlan(id);
  }

  @Patch('plans/:id/toggle')
  @ApiOperation({ summary: 'Tarifni faollashtirish yoki oʻchirish' })
  async togglePlan(@Param('id') id: string) {
    return this.subscriptionsService.adminTogglePlan(id);
  }

  // === USER SUBSCRIPTION CRUD ENDPOINTS ===
  @Patch(':id')
  @ApiOperation({
    summary: 'Foydalanuvchi obunasini tahrirlash (status, muddat, izoh)',
  })
  async updateUserSubscription(
    @Param('id') id: string,
    @Body() dto: UpdateUserSubscriptionDto,
  ) {
    return this.subscriptionsService.adminUpdateUserSubscription(id, dto);
  }

  @Post(':id/extend')
  @ApiOperation({ summary: 'Foydalanuvchi obunasini N kunga uzaytirish' })
  async extendUserSubscription(
    @Param('id') id: string,
    @Body('days') days: number,
  ) {
    return this.subscriptionsService.adminExtendSubscription(id, days || 30);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Foydalanuvchi obunasini bekor qilish va oʻchirish',
  })
  async deleteUserSubscription(@Param('id') id: string) {
    return this.subscriptionsService.adminDeleteUserSubscription(id);
  }
}
