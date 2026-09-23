import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Lấy toàn bộ danh sách gói ăn đang hoạt động (isActive: true)
  async findAll() {
    return this.prisma.mealPackage.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    });
  }

  // 2. Lấy chi tiết 1 gói ăn theo ID
  async findOne(id: number) {
    const plan = await this.prisma.mealPackage.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Không tìm thấy gói ăn với ID ${id}`);
    }

    return plan;
  }
}

