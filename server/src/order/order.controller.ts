import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import { BookMealDto } from './dto/BookMealDto.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 👉 1. POST /api/order/book : Khách đặt món cho ngày
  @Post('book')
  async bookMeal(@Req() req: any, @Body() dto: BookMealDto) {
    const userId = req.user.id || req.user.userId;
    return this.orderService.bookMeal(userId, dto);
  }

  // 👉 2. PATCH /api/order/:id/cancel : Khách hủy món trước 22h
  @Patch(':id/cancel')
  async cancelMealOrder(
    @Req() req: any,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    const userId = req.user.id || req.user.userId;
    return this.orderService.cancelMealOrder(userId, orderId);
  }

  // 👉 3. GET /api/order/my-orders : Lấy danh sách đơn đặt món của khách
  @Get('my-orders')
  async getMyOrders(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.id || req.user.userId;
    return this.orderService.getMyOrders(userId, startDate, endDate);
  }
}
