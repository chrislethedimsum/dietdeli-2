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
   * Menu.date trong Prisma đang dùng @db.Date
   */
  private parseDate(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }

  /**
   * Kiểm tra ngày đã qua hay chưa.
   *
   * Hôm nay: cho phép
   * Ngày tương lai: cho phép
   * Ngày trước hôm nay: không cho phép
   */
  private isPastDate(date: Date): boolean {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate < today;
  }

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
        dish: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        dish: true,
      },
    });

    if (!menu) {
      throw new NotFoundException(`Không tìm thấy menu với ID ${id}`);
    }

    return menu;
  }

  async create(dto: CreateMenuDto) {
    const menuDate = this.parseDate(dto.date);

    // ==========================================
    // 1. Không cho tạo menu ở ngày đã qua
    // ==========================================
    if (this.isPastDate(menuDate)) {
      throw new BadRequestException('Không thể thêm menu cho ngày đã qua');
    }

    // ==========================================
    // 2. Kiểm tra dish
    // ==========================================
    const dish = await this.prisma.dish.findFirst({
      where: {
        id: dto.dishId,
        isDeleted: false,
      },
    });

    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${dto.dishId}`);
    }

    // ==========================================
    // 3. Không cho cùng món trong cùng ngày
    // ==========================================
    const duplicateMenu = await this.prisma.menu.findFirst({
      where: {
        dishId: dto.dishId,
        date: menuDate,
      },
    });

    if (duplicateMenu) {
      throw new BadRequestException('Món ăn này đã có trong menu của ngày này');
    }

    // ==========================================
    // 4. Một ngày tối đa 2 món
    // ==========================================
    const menuCount = await this.prisma.menu.count({
      where: {
        date: menuDate,
      },
    });

    if (menuCount >= 2) {
      throw new BadRequestException('Mỗi ngày chỉ được tối đa 2 món');
    }

    // ==========================================
    // 5. Tạo menu
    // ==========================================
    return this.prisma.menu.create({
      data: {
        dishId: dto.dishId,
        date: menuDate,
      },
      include: {
        dish: true,
      },
    });
  }

  async update(id: number, dto: CreateMenuDto) {
    // ==========================================
    // 1. Kiểm tra menu tồn tại
    // ==========================================
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Không tìm thấy menu với ID ${id}`);
    }

    // ==========================================
    // 2. Không cho sửa menu của ngày đã qua
    // ==========================================
    if (this.isPastDate(menu.date)) {
      throw new BadRequestException('Không thể sửa menu của ngày đã qua');
    }

    const newMenuDate = this.parseDate(dto.date);

    // ==========================================
    // 3. Không cho chuyển menu sang ngày đã qua
    // ==========================================
    if (this.isPastDate(newMenuDate)) {
      throw new BadRequestException('Không thể chuyển menu sang ngày đã qua');
    }

    // ==========================================
    // 4. Kiểm tra dish
    // ==========================================
    const dish = await this.prisma.dish.findFirst({
      where: {
        id: dto.dishId,
        isDeleted: false,
      },
    });

    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${dto.dishId}`);
    }

    // ==========================================
    // 5. Không cho trùng món trong cùng ngày
    // ==========================================
    const duplicateMenu = await this.prisma.menu.findFirst({
      where: {
        dishId: dto.dishId,
        date: newMenuDate,
        NOT: {
          id,
        },
      },
    });

    if (duplicateMenu) {
      throw new BadRequestException('Món ăn này đã có trong menu của ngày này');
    }

    // ==========================================
    // 6. Nếu chuyển sang ngày khác,
    //    kiểm tra ngày đó tối đa 2 món
    // ==========================================
    if (menu.date.getTime() !== newMenuDate.getTime()) {
      const menuCount = await this.prisma.menu.count({
        where: {
          date: newMenuDate,
        },
      });

      if (menuCount >= 2) {
        throw new BadRequestException('Ngày được chọn đã có đủ 2 món');
      }
    }

    // ==========================================
    // 7. Update
    // ==========================================
    return this.prisma.menu.update({
      where: { id },
      data: {
        dishId: dto.dishId,
        date: newMenuDate,
      },
      include: {
        dish: true,
      },
    });
  }

  async remove(id: number) {
    // ==========================================
    // 1. Kiểm tra menu tồn tại
    // ==========================================
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });

    if (!menu) {
      throw new NotFoundException(`Không tìm thấy menu với ID ${id}`);
    }

    // ==========================================
    // 2. Không cho xóa menu của ngày đã qua
    // ==========================================
    if (this.isPastDate(menu.date)) {
      throw new BadRequestException('Không thể xóa menu của ngày đã qua');
    }

    // ==========================================
    // 3. Xóa
    // ==========================================
    await this.prisma.menu.delete({
      where: { id },
    });

    return {
      message: 'Xóa menu thành công',
    };
  }
}
