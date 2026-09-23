import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Khởi tạo app thuần túy, không cần instrument của Observe
  const app = await NestFactory.create(AppModule);

  // 1. Thêm tiền tố /api cho toàn bộ routes (http://localhost:3000/api/...)
  app.setGlobalPrefix('api');

  // 2. Bật CORS cho React kết nối
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // 3. Tự động kiểm tra dữ liệu gửi lên theo DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api`);
}
await bootstrap();