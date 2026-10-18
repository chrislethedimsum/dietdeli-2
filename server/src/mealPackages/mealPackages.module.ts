import { Module } from '@nestjs/common';
import { MealPackagesController } from './mealPackages.controller.js';
import { MealPackagesService } from './mealPackages.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [MealPackagesController],
  providers: [MealPackagesService],
  exports: [MealPackagesService],
})
export class MealPackagesModule {}
