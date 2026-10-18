import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { MealPackagesService } from './mealPackages.service.js';
import { CreateMealPackageDto } from './dto/create-mealpackage.dto.js';
import { UpdateMealPackageDto } from './dto/update-mealpackage.dto.js';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';

@Controller('mealpackages')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MealPackagesController {
  constructor(private readonly mealPackagesService: MealPackagesService) {}

  /**
   * GET /mealpackages
   * GET /mealpackages?search=dinh duong
   * GET /mealpackages?isActive=true
   */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.mealPackagesService.findAll(search, isActive);
  }

  /**
   * GET /mealpackages/:id
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.mealPackagesService.findOne(id);
  }

  /**
   * POST /mealpackages
   */
  @Post()
  create(@Body() dto: CreateMealPackageDto) {
    return this.mealPackagesService.create(dto);
  }

  /**
   * PATCH /mealpackages/:id
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMealPackageDto,
  ) {
    return this.mealPackagesService.update(id, dto);
  }

  /**
   * PATCH /mealpackages/:id/toggle-status
   */
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.mealPackagesService.toggleStatus(id);
  }

  /**
   * DELETE /mealpackages/:id
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mealPackagesService.remove(id);
  }
}
