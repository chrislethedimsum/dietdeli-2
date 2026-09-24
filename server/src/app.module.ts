import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { PlansModule } from './plans/plans.module.js';
import { DishModule } from './dish/dish.module.js';
import { SubscriptionModule } from './subscription/subscription.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PlansModule,
    DishModule,
     ConfigModule.forRoot({ isGlobal: true }),
     PlansModule,
     SubscriptionModule, // 👈 Nạp .env cho toàn bộ app
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
