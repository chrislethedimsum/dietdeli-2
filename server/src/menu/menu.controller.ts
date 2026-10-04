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

import { MenuService } from './menu.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { CreateMenuDto } from './dto/create-menu.dto.js';

@Controller('menus')
@UseGuards(JwtAuthGuard, AdminGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  /**
   * GET /api/menus
   * GET /api/menus?startDate=2026-09-28&endDate=2026-10-04
   */
  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.menuService.findAll(startDate, endDate);
  }

  /**
   * GET /api/menus/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  /**
   * POST /api/menus
   */
  @Post()
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  /**
   * PATCH /api/menus/:id
   */
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateMenuDto,
  ) {
    return this.menuService.update(id, dto);
  }

  /**
   * DELETE /api/menus/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
