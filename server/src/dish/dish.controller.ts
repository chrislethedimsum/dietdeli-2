import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DishService } from './dish.service.js';
import { CreateDishDto } from './dto/createDish.dto.js';
import { UpdateDishDto } from './dto/updateDish.dto.js';
import { AuthGuard } from '@nestjs/passport';
import type { Multer } from 'multer';

@Controller('dish')
export class DishController {
  constructor(private readonly dishService: DishService) {}

  @Get()
  async findAll() {
    return this.dishService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dishService.findOne(id);
  }

  // @Post()
  // @UseGuards(AuthGuard('jwt'))
  // async create(@Body() createDishDto: CreateDishDto) {
  //   return this.dishService.create(createDishDto);
  // }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createDishDto: CreateDishDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.dishService.create(
      createDishDto,
      image,
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.dishService.update(id, updateDishDto, image);
  }
}
