import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convert YYYY-MM-DD -> Date
   */
  private parseDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }

  /**
   * GET /api/menus
   *
   * Lấy toàn bộ menu
   */
  async findAll(startDate?: string, endDate?: string) {
    return this.prisma.menu.findMany({
      where: {
        ...(startDate &&
          endDate && {
            date: {
              gte: this.parseDate(startDate),
              lte: this.parseDate(endDate),
            },
          }),
      },
      include: {
        dish: {
          omit: {
            isDeleted: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  /**
   * GET /api/menus/:id
   *
   * Lấy một menu
   */
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: {
        id,
      },
      include: {
        dish: {
          omit: {
            isDeleted: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException('Không tìm thấy menu');
    }

    return menu;
  }

  /**
   * POST /api/menus
   *
   * Thêm món vào menu
   */
  async create(dto: CreateMenuDto) {
    const { dishId, date } = dto;

    const menuDate = this.parseDate(date);

    // =========================
    // Kiểm tra món ăn
    // Chỉ cho phép dish chưa bị xoá
    // =========================

    const dish = await this.prisma.dish.findFirst({
      where: {
        id: dishId,
        isDeleted: false,
      },
    });

    if (!dish) {
      throw new NotFoundException(
        'Không tìm thấy món ăn hoặc món ăn đã bị xoá',
      );
    }

    // =========================
    // Kiểm tra món đã tồn tại
    // trong cùng ngày
    // =========================

    const existingMenu = await this.prisma.menu.findFirst({
      where: {
        dishId,
        date: menuDate,
      },
    });

    if (existingMenu) {
      throw new BadRequestException('Món ăn này đã có trong menu của ngày');
    }

    // =========================
    // Kiểm tra tối đa 2 món/ngày
    // =========================

    const menuCount = await this.prisma.menu.count({
      where: {
        date: menuDate,
      },
    });

    if (menuCount >= 2) {
      throw new BadRequestException('Menu của ngày này đã có đủ 2 món');
    }

    // =========================
    // Tạo menu
    // =========================

    return this.prisma.menu.create({
      data: {
        dishId,
        date: menuDate,
      },
      include: {
        dish: {
          omit: {
            isDeleted: true,
          },
        },
      },
    });
  }

  /**
   * PATCH /api/menus/:id
   *
   * Đổi món trong menu
   */
  async update(id: number, dto: CreateMenuDto) {
    const { dishId, date } = dto;

    const menuDate = this.parseDate(date);

    // =========================
    // Kiểm tra menu hiện tại
    // =========================

    const menu = await this.prisma.menu.findUnique({
      where: {
        id,
      },
    });

    if (!menu) {
      throw new NotFoundException('Không tìm thấy menu');
    }

    // =========================
    // Kiểm tra món ăn
    // Chỉ cho phép dish chưa bị xoá
    // =========================

    const dish = await this.prisma.dish.findFirst({
      where: {
        id: dishId,
        isDeleted: false,
      },
    });

    if (!dish) {
      throw new NotFoundException(
        'Không tìm thấy món ăn hoặc món ăn đã bị xoá',
      );
    }

    // =========================
    // Kiểm tra trùng món
    // trong cùng ngày
    // =========================

    const duplicate = await this.prisma.menu.findFirst({
      where: {
        dishId,
        date: menuDate,
        NOT: {
          id,
        },
      },
    });

    if (duplicate) {
      throw new BadRequestException('Món ăn này đã có trong menu của ngày');
    }

    // =========================
    // Kiểm tra tối đa 2 món/ngày
    //
    // Loại trừ menu hiện tại vì
    // nó có thể đang thuộc ngày cũ
    // =========================

    const menuCount = await this.prisma.menu.count({
      where: {
        date: menuDate,
        NOT: {
          id,
        },
      },
    });

    if (menuCount >= 2) {
      throw new BadRequestException('Menu của ngày này đã có đủ 2 món');
    }

    // =========================
    // Update menu
    // =========================

    return this.prisma.menu.update({
      where: {
        id,
      },
      data: {
        dishId,
        date: menuDate,
      },
      include: {
        dish: {
          omit: {
            isDeleted: true,
          },
        },
      },
    });
  }

  /**
   * DELETE /api/menus/:id
   */
  async remove(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: {
        id,
      },
    });

    if (!menu) {
      throw new NotFoundException('Không tìm thấy menu');
    }

    await this.prisma.menu.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Xóa món khỏi menu thành công',
    };
  }
}
