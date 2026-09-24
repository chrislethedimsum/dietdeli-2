import { Controller, Post, Patch, Body, Param, ParseIntPipe, Get } from '@nestjs/common';
import { DishService } from './dish.service.js';
import { CreateDishDto } from './dto/createDish.dto.js';
import { UpdateDishDto } from './dto/updateDish.dto.js';

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

  @Post()
  async create(@Body() createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDishDto: UpdateDishDto,
  ) {
    return this.dishService.update(id, updateDishDto);
  }
}
