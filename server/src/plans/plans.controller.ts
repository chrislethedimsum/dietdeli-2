import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PlansService } from './plans.service.js';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  // 👉 GET /api/plans : Lấy danh sách toàn bộ gói ăn
  @Get()
  async getAllPlans() {
    return this.plansService.findAll();
  }

  // 👉 GET /api/plans/:id : Lấy chi tiết 1 gói ăn (VD: /api/plans/1)
  @Get(':id')
  async getPlanById(@Param('id', ParseIntPipe) id: number) {
    return this.plansService.findOne(id);
  }
}