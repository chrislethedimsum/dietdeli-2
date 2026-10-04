// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "meal_package" RESTART IDENTITY CASCADE;`,
  );
  console.log('Xóa dữ liệu cũ! Chuẩn bị seed dữ liệu mới !');
  await prisma.mealPackage.createMany({
    data: [
      {
        name: 'Ngày 1 Bữa',
        caloriesPerMeal: 400,
        durationDays: 2,
        totalMeals: 1,
        price: 73000,
      },
      {
        name: 'Ngày 2 Bữa',
        caloriesPerMeal: 400,
        durationDays: 2,
        totalMeals: 2,
        price: 140000,
      },
      {
        name: 'Tuần 1 Bữa',
        caloriesPerMeal: 400,
        durationDays: 14,
        totalMeals: 6,
        price: 408000,
      },
      {
        name: 'Tuần 2 Bữa',
        caloriesPerMeal: 400,
        durationDays: 14,
        totalMeals: 12,
        price: 816000,
      },
      {
        name: 'Tháng 1 Bữa',
        caloriesPerMeal: 400,
        durationDays: 60,
        totalMeals: 24,
        price: 1512000,
      },
      {
        name: 'Tháng 2 Bữa',
        caloriesPerMeal: 400,
        durationDays: 60,
        totalMeals: 48,
        price: 3024000,
      },
      {
        name: 'Ngày 1 Bữa',
        caloriesPerMeal: 600,
        durationDays: 2,
        totalMeals: 1,
        price: 77000,
      },
      {
        name: 'Ngày 2 Bữa',
        caloriesPerMeal: 600,
        durationDays: 2,
        totalMeals: 2,
        price: 150000,
      },
      {
        name: 'Tuần 1 Bữa',
        caloriesPerMeal: 600,
        durationDays: 14,
        totalMeals: 6,
        price: 438000,
      },
      {
        name: 'Tuần 2 Bữa',
        caloriesPerMeal: 600,
        durationDays: 14,
        totalMeals: 12,
        price: 876000,
      },
      {
        name: 'Tháng 1 Bữa',
        caloriesPerMeal: 600,
        durationDays: 60,
        totalMeals: 24,
        price: 1584000,
      },
      {
        name: 'Tháng 2 Bữa',
        caloriesPerMeal: 600,
        durationDays: 60,
        totalMeals: 48,
        price: 3168000,
      },
      {
        name: 'Ngày 1 Bữa',
        caloriesPerMeal: 800,
        durationDays: 2,
        totalMeals: 1,
        price: 80000,
      },
      {
        name: 'Ngày 2 Bữa',
        caloriesPerMeal: 800,
        durationDays: 2,
        totalMeals: 2,
        price: 155000,
      },
      {
        name: 'Tuần 1 Bữa',
        caloriesPerMeal: 800,
        durationDays: 14,
        totalMeals: 6,
        price: 450000,
      },
      {
        name: 'Tuần 2 Bữa',
        caloriesPerMeal: 800,
        durationDays: 14,
        totalMeals: 12,
        price: 900000,
      },
      {
        name: 'Tháng 1 Bữa',
        caloriesPerMeal: 800,
        durationDays: 60,
        totalMeals: 24,
        price: 1680000,
      },
      {
        name: 'Tháng 2 Bữa',
        caloriesPerMeal: 800,
        durationDays: 60,
        totalMeals: 48,
        price: 3360000,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.dish.createMany({
    data: [
      {
        id: 1,
        nameVi: 'Ức gà áp chảo',
        nameEn: 'Pan-seared Chicken Breast',
        descriptionVi:
          'Ức gà áp chảo kết hợp rau củ và khoai lang, giàu protein.',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435',
        isDeleted: false,
      },
      {
        id: 2,
        nameVi: 'Cá hồi nướng',
        nameEn: 'Grilled Salmon',
        descriptionVi:
          'Cá hồi nướng cùng bông cải xanh và khoai tây, giàu Omega-3.',
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
        isDeleted: false,
      },
      {
        id: 3,
        nameVi: 'Bò lúc lắc',
        nameEn: 'Vietnamese Shaking Beef',
        descriptionVi:
          'Thịt bò mềm áp chảo cùng rau củ, cung cấp protein và năng lượng.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947',
        isDeleted: false,
      },
      {
        id: 4,
        nameVi: 'Salad ức gà',
        nameEn: 'Chicken Breast Salad',
        descriptionVi: 'Salad rau xanh kết hợp ức gà và sốt mè rang.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
        isDeleted: false,
      },
      {
        id: 5,
        nameVi: 'Cơm gạo lứt thịt gà',
        nameEn: 'Brown Rice Chicken',
        descriptionVi: 'Gạo lứt kết hợp ức gà, rau củ và trứng luộc.',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        isDeleted: false,
      },
      {
        id: 6,
        nameVi: 'Mì Ý bò bằm',
        nameEn: 'Beef Bolognese',
        descriptionVi:
          'Mì Ý sốt cà chua thịt bò bằm, phù hợp cho bữa ăn giàu năng lượng.',
        image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0',
        isDeleted: false,
      },
      {
        id: 7,
        nameVi: 'Tôm xào rau củ',
        nameEn: 'Stir-fried Shrimp',
        descriptionVi: 'Tôm tươi xào cùng các loại rau củ theo mùa.',
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
        isDeleted: false,
      },
      {
        id: 8,
        nameVi: 'Trứng cuộn rau củ',
        nameEn: 'Vegetable Egg Roll',
        descriptionVi:
          'Trứng cuộn với rau củ tươi, nhẹ nhàng và giàu dinh dưỡng.',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8',
        isDeleted: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed dữ liệu thành công!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
