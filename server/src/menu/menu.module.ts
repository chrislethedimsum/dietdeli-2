import { Module } from '@nestjs/common';
import { MenuService } from './menu.service.js';
import { MenuController } from './menu.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  providers: [MenuService],
  controllers: [MenuController],
})
export class MenuModule {}
