import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDishDto } from './dto/createDish.dto.js';
import { UpdateDishDto } from './dto/updateDish.dto.js';
import { UploadService } from '../upload/upload.service.js';
import { log } from 'console';

@Injectable()
export class DishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll() {
    return this.prisma.dish.findMany({
      where: { isDeleted: false },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    const dish = await this.prisma.dish.findUnique({
      where: { id, isDeleted: false },
    });

    if (!dish) {
      throw new Error(`Không tìm thấy món ăn với ID ${id}`);
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
    });
  }

  async update(
    id: number,
    updateDishDto: UpdateDishDto,
    image?: Express.Multer.File,
  ) {
    const dishExists = await this.prisma.dish.findUnique({
      where: { id },
    });

    if (!dishExists) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${id}`);
    }

    let imageUrl: string | null = dishExists.image;
    if (image) {
      imageUrl = await this.uploadService.uploadImage(image, 'dietdeli/dish');
    }

    return this.prisma.dish.update({
      where: { id },
      data: { ...updateDishDto, image: imageUrl },
    });
  }

  async remove(id: number) {
    const dishExists = await this.prisma.dish.findUnique({
      where: { id },
    });

    if (!dishExists) {
      throw new NotFoundException(`Không tìm thấy món ăn với ID ${id}`);
    }

    return this.prisma.dish.update({
      where: { id },
      data: { ...dishExists, isDeleted: true },
    });
  }
}
