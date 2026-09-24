import { Module } from '@nestjs/common';
import { DishController } from './dish.controller.js';
import { DishService } from './dish.service.js';

@Module({
  controllers: [DishController],
  providers: [DishService]
})
export class DishModule {}
