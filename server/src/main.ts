import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Tiền tố toàn bộ API: http://localhost:3000/api/...
  app.setGlobalPrefix('api');

  // 2. Bật CORS cho React Vite (port 5173)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // 3. Tự động kiểm tra dữ liệu đầu vào DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();