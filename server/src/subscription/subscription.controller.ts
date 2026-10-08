import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service.js';
import {
  CheckoutSubscriptionDto,
  UpdateSubscriptionInfoDto,
} from './dto/usersubscription.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // 👉 1. POST /api/subscriptions/checkout (Khách hàng tạo đơn mua gói)
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Req() req: any, @Body() dto: CheckoutSubscriptionDto) {
    const userId = req.user.id || req.user.userId;
    return this.subscriptionService.checkout(userId, dto);
  }

  // 👉 2. PATCH /api/subscriptions/:id/status (Đánh dấu trạng thái thanh toán thủ công)
  // Ví dụ: body { "status": "PAID" }
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'PAID' | 'UNPAID' | 'CANCELLED',
  ) {
    return this.subscriptionService.updatePaymentStatus(id, status || 'PAID');
  }

  // 👉 3. PATCH /api/subscriptions/:id (Khách hàng cập nhật thông tin giao hàng gói)
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateSubscriptionInfo(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionInfoDto,
  ) {
    const userId = req.user.id || req.user.userId;
    return this.subscriptionService.updateSubscriptionInfo(userId, id, dto);
  }

  // 👉 4. GET /api/subscriptions/my-subscriptions (Khách xem các gói đã mua của mình)
  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(@Req() req: any) {
    const userId = req.user.id || req.user.userId;
    return this.subscriptionService.getUserSubscriptions(userId);
  }

  // 👉 5. GET /api/subscriptions (Lấy toàn bộ danh sách để Admin duyệt đơn)
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAllSubscriptions() {
    return this.subscriptionService.getAllSubscriptions();
  }
}
