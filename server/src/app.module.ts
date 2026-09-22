import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js'; // 👈 1. Import AuthModule

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
    AuthModule, // 👈 2. Thêm vào đây để NestJS nạp các route Auth
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}