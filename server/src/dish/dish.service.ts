import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDishDto } from './dto/createDish.dto.js';
import { UpdateDishDto } from './dto/updateDish.dto.js';

@Injectable()
export class DishService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dish.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
    });

    if (!dish) {
      throw new Error(`Không tìm thấy món ăn với ID ${id}`);
    }

    return dish;
  }

  async create(createDishDto: CreateDishDto) {
    return this.prisma.dish.create({
      data: createDishDto,
    });
  }

  async update(id: number, updateDishDto: UpdateDishDto) {
    const dishExists = await this.prisma.dish.findUnique({
      where: { id },
    });

    if (!dishExists) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${id}`);
    }

    return this.prisma.dish.update({
      where: { id },
      data: updateDishDto,
    });
  }
}
