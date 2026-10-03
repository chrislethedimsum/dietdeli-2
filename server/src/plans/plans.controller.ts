import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { PlansService } from './plans.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // 👉 GET /api/plans : Lấy danh sách toàn bộ gói ăn
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPlans() {
    return this.plansService.findAll();
  }

  // 👉 GET /api/plans/:id : Lấy chi tiết 1 gói ăn (VD: /api/plans/1)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPlanById(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findOne(id);
  }
}
