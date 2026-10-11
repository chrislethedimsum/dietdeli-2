import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMealPackageDto } from './dto/create-mealpackage.dto.js';
import { UpdateMealPackageDto } from './dto/update-mealpackage.dto.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class MealPackagesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách gói suất ăn.
   * Hỗ trợ tìm kiếm theo tên/mô tả và lọc trạng thái.
   */
  async findAll(search?: string, isActive?: string) {
    const keyword = search?.trim();

    const where: Prisma.MealPackageWhereInput = {
      ...(keyword
        ? {
            OR: [
              {
                name: {
                  contains: keyword,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: keyword,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(isActive === 'true'
        ? { isActive: true }
        : isActive === 'false'
          ? { isActive: false }
          : {}),
    };

    return this.prisma.mealPackage.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Lấy thông tin một gói suất ăn.
   */
  async findOne(id: number) {
    const mealPackage = await this.prisma.mealPackage.findUnique({
      where: { id },
    });

    if (!mealPackage) {
      throw new NotFoundException(`Không tìm thấy gói suất ăn có ID ${id}`);
    }

    return mealPackage;
  }

  /**
   * Tạo gói suất ăn mới.
   */
  async create(dto: CreateMealPackageDto) {
    return this.prisma.mealPackage.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() ?? '',
        caloriesPerMeal: dto.caloriesPerMeal,
        durationDays: dto.durationDays,
        price: dto.price,
        totalMeals: dto.totalMeals,
        isActive: dto.isActive ?? true,
      },
    });
  }

  /**
   * Cập nhật thông tin gói suất ăn.
   */
  async update(id: number, dto: UpdateMealPackageDto) {
    await this.findOne(id);

    const data: Prisma.MealPackageUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      data.description = dto.description.trim();
    }

    if (dto.caloriesPerMeal !== undefined) {
      data.caloriesPerMeal = dto.caloriesPerMeal;
    }

    if (dto.durationDays !== undefined) {
      data.durationDays = dto.durationDays;
    }

    if (dto.price !== undefined) {
      data.price = dto.price;
    }

    if (dto.totalMeals !== undefined) {
      data.totalMeals = dto.totalMeals;
    }

    if (dto.isActive !== undefined) {
      data.isActive = dto.isActive;
    }

    return this.prisma.mealPackage.update({
      where: { id },
      data,
    });
  }

  /**
   * Bật/tắt trạng thái hoạt động.
   */
  async toggleStatus(id: number) {
    const mealPackage = await this.findOne(id);

    return this.prisma.mealPackage.update({
      where: { id },
      data: {
        isActive: !mealPackage.isActive,
      },
    });
  }

  /**
   * Xóa gói suất ăn.
   */
  async remove(id: number) {
    await this.findOne(id);

    try {
      return await this.prisma.mealPackage.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Không thể xóa gói suất ăn vì đang được sử dụng bởi đơn hàng hoặc đăng ký.',
        );
      }

      throw error;
    }
  }
}
