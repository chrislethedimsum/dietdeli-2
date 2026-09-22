import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from './contract.json' with { type: 'json' };

// Dùng (postgres as any) để bỏ qua lỗi type nội bộ của bản Prisma 8 RC
export const db: any = (postgres as any)({
  contractJson,
  url: process.env['DATABASE_URL']!,
});