import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDishDto } from './dto/createDish.dto.js';
import { UpdateDishDto } from './dto/updateDish.dto.js';
import { UploadService } from '../upload/upload.service.js';

@Injectable()
export class DishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll() {
    return this.prisma.dish.findMany({
      where: {
        isDeleted: false,
      },
      omit: {
        isDeleted: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const dish = await this.prisma.dish.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      omit: {
        isDeleted: true,
      },
    });

    if (!dish) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${id}`);
    }

    return dish;
  }

  async create(createDishDto: CreateDishDto, image?: Express.Multer.File) {
    let imageUrl: string | null = null;

    if (image) {
      imageUrl = await this.uploadService.uploadImage(image, 'dietdeli/dish');
    }

    return this.prisma.dish.create({
      data: {
        ...createDishDto,
        image: imageUrl,
      },
      omit: {
        isDeleted: true,
      },
    });
  }

  async update(
    id: number,
    updateDishDto: UpdateDishDto,
    image?: Express.Multer.File,
  ) {
    const dishExists = await this.prisma.dish.findUnique({
      where: {
        id,
      },
    });

    if (!dishExists) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${id}`);
    }

    let imageUrl: string | null = dishExists.image;

    if (image) {
      imageUrl = await this.uploadService.uploadImage(image, 'dietdeli/dish');
    }

    return this.prisma.dish.update({
      where: {
        id,
      },
      data: {
        ...updateDishDto,
        image: imageUrl,
      },
      omit: {
        isDeleted: true,
      },
    });
  }

  async remove(id: number) {
    const dishExists = await this.prisma.dish.findUnique({
      where: {
        id,
      },
    });

    if (!dishExists) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${id}`);
    }

    await this.prisma.dish.update({
      where: {
        id,
      },
      data: {
        isDeleted: true,
      },
    });

    return {
      message: 'Xóa món ăn thành công',
    };
  }
}
