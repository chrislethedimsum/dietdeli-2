import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
//   exports: [UsersService],
})
export class UsersModule {}
