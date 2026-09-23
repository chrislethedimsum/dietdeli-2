// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "meal_package" RESTART IDENTITY CASCADE;`);
  console.log('Xóa dữ liệu cũ! Chuẩn bị seed dữ liệu mới !');
  await prisma.mealPackage.createMany({
    data: [
      { name: 'Ngày 1 Bữa', caloriesPerMeal: 400, durationDays: 2, totalMeals: 1, price: 73000, },
      { name: 'Ngày 2 Bữa', caloriesPerMeal: 400, durationDays: 2, totalMeals: 2, price: 140000, },
      { name: 'Tuần 1 Bữa', caloriesPerMeal: 400, durationDays: 14, totalMeals: 1, price: 408000, },
      { name: 'Tuần 2 Bữa', caloriesPerMeal: 400, durationDays: 14, totalMeals: 2, price: 816000, },
      { name: 'Tháng 1 Bữa', caloriesPerMeal: 400, durationDays: 60, totalMeals: 1, price: 1512000, },
      { name: 'Tháng 2 Bữa', caloriesPerMeal: 400, durationDays: 60, totalMeals: 2, price: 3024000, },
      { name: 'Ngày 1 Bữa', caloriesPerMeal: 600, durationDays: 2, totalMeals: 1, price: 77000, },
      { name: 'Ngày 2 Bữa', caloriesPerMeal: 600, durationDays: 2, totalMeals: 2, price: 150000, },
      { name: 'Tuần 1 Bữa', caloriesPerMeal: 600, durationDays: 14, totalMeals: 1, price: 438000, },
      { name: 'Tuần 2 Bữa', caloriesPerMeal: 600, durationDays: 14, totalMeals: 2, price: 876000, },
      { name: 'Tháng 1 Bữa', caloriesPerMeal: 600, durationDays: 60, totalMeals: 1, price: 1584000, },
      { name: 'Tháng 2 Bữa', caloriesPerMeal: 600, durationDays: 60, totalMeals: 2, price: 3168000, },
      { name: 'Ngày 1 Bữa', caloriesPerMeal: 800, durationDays: 2, totalMeals: 1, price: 80000, },
      { name: 'Ngày 2 Bữa', caloriesPerMeal: 800, durationDays: 2, totalMeals: 2, price: 155000, },
      { name: 'Tuần 1 Bữa', caloriesPerMeal: 800, durationDays: 14, totalMeals: 1, price: 450000, },
      { name: 'Tuần 2 Bữa', caloriesPerMeal: 800, durationDays: 14, totalMeals: 2, price: 900000, },
      { name: 'Tháng 1 Bữa', caloriesPerMeal: 800, durationDays: 60, totalMeals: 1, price: 1680000, },
      { name: 'Tháng 2 Bữa', caloriesPerMeal: 800, durationDays: 60, totalMeals: 2, price: 3360000, },
    ],
    skipDuplicates: true,
  });

  console.log('Seed dữ liệu thành công!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());