import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderTimeValidator } from '../utils/order-time.util.js';
import { BookMealDto } from './dto/BookMealDto.dto.js';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  async bookMeal(userId: number, dto: BookMealDto) {
    const dateStr = dto.deliveryDate.slice(0, 10);
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);
    const deliveryDate = startOfDay;

    // 1. Kiểm tra giờ chốt món (Trước 22h tối hôm trước)
    if (!OrderTimeValidator.validateDailyCutoff(dateStr)) {
      throw new BadRequestException(
        'Đã quá 22:00 tối hôm trước. Bếp đã chốt nguyên liệu cho ngày này, vui lòng chọn đặt từ các ngày tiếp theo!',
      );
    }

    // 2. Kiểm tra gói ăn: Phải PAID, còn bữa, và ngày giao nằm trong thời hạn gói
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        idUser: userId,
        paymentStatus: 'PAID', // 👈 BẮT BUỘC ĐÃ ĐƯỢC ADMIN DUYỆT
        remainingMeals: { gte: dto.totalMealsToDeduct }, // Đủ suất ăn để trừ
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      throw new BadRequestException(
        'Bạn không có gói ăn hợp lệ đã thanh toán hoặc đã hết số bữa ăn khả dụng!',
      );
    }

    // Xác định số bữa tối đa/ngày dựa theo tên gói ăn (1 Bữa / Ngày hoặc 2 Bữa / Ngày)
    const pkgName = (subscription.package?.name || '').toLowerCase();
    const maxMealsPerDay =
      pkgName.includes('2 bữa') ||
      pkgName.includes('2 bua') ||
      pkgName.includes('2bữa')
        ? 2
        : 1;

    // 3. Lấy danh sách các đơn đã đặt (chưa hủy) trong ngày này của khách
    const existingOrdersOnDay = await this.prisma.order.findMany({
      where: {
        userId,
        deliveryDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      },
      include: {
        orderItems: true,
      },
    });

    const totalMealsAlreadyBooked = existingOrdersOnDay.reduce(
      (sum, ord) =>
        sum + ord.orderItems.reduce((iSum, item) => iSum + item.quantity, 0),
      0,
    );

    // Kiểm tra giới hạn số bữa trong ngày theo gói
    if (totalMealsAlreadyBooked + dto.totalMealsToDeduct > maxMealsPerDay) {
      if (maxMealsPerDay === 1) {
        throw new BadRequestException(
          'Gói của bạn là gói 1 Bữa / Ngày và bạn đã đặt 1 món cho ngày này rồi. Vui lòng hủy món đã đặt trước 22:00 hôm trước nếu muốn đổi sang món khác!',
        );
      } else {
        throw new BadRequestException(
          'Gói của bạn là gói 2 Bữa / Ngày và bạn đã đặt đủ 2 món cho ngày này rồi!',
        );
      }
    }

    // Không cho đặt trùng một món 2 lần trong cùng một ngày
    const newDishId = dto.items[0]?.dishId;
    const hasAlreadyOrderedThisDish = existingOrdersOnDay.some((ord) =>
      ord.orderItems.some((item) => item.dishId === newDishId),
    );
    if (hasAlreadyOrderedThisDish) {
      throw new BadRequestException(
        'Bạn đã đặt món này cho ngày này rồi. Vui lòng chọn món còn lại trong thực đơn!',
      );
    }

    // Tự động phân bổ ca ăn hợp lý (Bữa trưa / Bữa tối) tránh trùng ca
    let assignedShift = dto.mealShift || 'LUNCH';
    const hasLunch = existingOrdersOnDay.some((o) => o.mealShift === 'LUNCH');
    const hasDinner = existingOrdersOnDay.some((o) => o.mealShift === 'DINNER');

    if (hasLunch && !hasDinner) {
      assignedShift = 'DINNER';
    } else if (hasDinner && !hasLunch) {
      assignedShift = 'LUNCH';
    }

    // 4. Thực hiện đặt món và trừ suất ăn an toàn bằng Prisma Transaction
    return this.prisma.$transaction(async (tx) => {
      // a. Tạo bản ghi đơn hàng ngày
      const order = await tx.order.create({
        data: {
          userId,
          userSubscriptionId: subscription.id,
          packageId: subscription.packageId,
          deliveryDate,
          mealShift: assignedShift,
          shippingAddress: subscription.planShippingAddress || '',
          shippingNote: subscription.userNote,
          status: 'ORDERED',
          orderItems: {
            create: dto.items.map((item) => ({
              dishId: item.dishId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              dish: true,
            },
          },
        },
      });

      // b. Trừ số bữa ăn trong gói
      await tx.userSubscription.update({
        where: { id: subscription.id },
        data: {
          remainingMeals: { decrement: dto.totalMealsToDeduct },
        },
      });

      return { message: 'Đặt món thành công!', order };
    });
  }

  async cancelMealOrder(userId: number, orderId: number) {
    // 1. Tìm đơn hàng
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { orderItems: true },
    });

    if (!order || order.status === 'CANCELLED') {
      throw new NotFoundException(
        'Đơn hàng không tồn tại hoặc đã bị hủy trước đó.',
      );
    }

    // 2. Kiểm tra giờ hủy: Phải hủy TRƯỚC 22:00 của ngày hôm trước
    if (!OrderTimeValidator.validateDailyCutoff(order.deliveryDate)) {
      throw new BadRequestException(
        'Không thể hủy món sau 22:00 tối hôm trước vì bếp đã nấu và chuẩn bị đơn của bạn!',
      );
    }

    // Tính số bữa ăn hoàn trả
    const mealsToRefund = order.orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // 3. Thực hiện hủy đơn và cộng lại bữa bằng Transaction
    return this.prisma.$transaction(async (tx) => {
      // a. Đổi trạng thái đơn thành CANCELLED
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      // b. Cộng lại số bữa ăn cho UserSubscription
      await tx.userSubscription.update({
        where: { id: order.userSubscriptionId },
        data: {
          remainingMeals: { increment: mealsToRefund },
        },
      });

      return {
        message: `Đã hủy món và hoàn lại ${mealsToRefund} bữa ăn vào gói của bạn!`,
      };
    });
  }

  async getMyOrders(userId: number, startDate?: string, endDate?: string) {
    const whereClause: any = {
      userId,
    };

    if (startDate && endDate) {
      const start = new Date(`${startDate.slice(0, 10)}T00:00:00.000Z`);
      const end = new Date(`${endDate.slice(0, 10)}T23:59:59.999Z`);
      whereClause.deliveryDate = {
        gte: start,
        lte: end,
      };
    }

    return this.prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: {
            dish: true,
          },
        },
        package: true,
      },
      orderBy: {
        deliveryDate: 'asc',
      },
    });
  }
}
