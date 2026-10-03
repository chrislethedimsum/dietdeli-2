import { Module } from '@nestjs/common';
import { DishController } from './dish.controller.js';
import { DishService } from './dish.service.js';
import { UploadModule } from '../upload/upload.module.js';

@Module({
  imports: [UploadModule],
  controllers: [DishController],
  providers: [DishService]
})
export class DishModule {}
