import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CheckoutSubscriptionDto } from './dto/usersubscription.dto.js';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. TẠO ĐƠN MUA GÓI (CHECKOUT)
  async checkout(userId: number, dto: CheckoutSubscriptionDto) {
    // a. Kiểm tra gói ăn tồn tại và đang hoạt động
    const mealPackage = await this.prisma.mealPackage.findUnique({
      where: { id: dto.packageId },
    });

    if (!mealPackage || !mealPackage.isActive) {
      throw new NotFoundException(
        `Gói ăn với ID ${dto.packageId} không tồn tại hoặc đã ngừng áp dụng`,
      );
    }

    // b. Tính toán ngày bắt đầu & ngày kết thúc
    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + mealPackage.durationDays);

    // c. Lưu vào bảng user_subscription (chuẩn theo cấu trúc DB hiện tại)
    const subscription = await this.prisma.userSubscription.create({
      data: {
        idUser: userId,
        packageId: mealPackage.id,
        startDate,
        endDate,
        paymentStatus: 'UNPAID',
        remainingMeals: mealPackage.totalMeals,
      },
      include: {
        package: true,
      },
    });

    // d. Dùng chính subscription.id làm mã đơn / cú pháp chuyển khoản
    const bankAccount = '0389150399';
    const bankCode = 'MB'; // MBBank
    const accountName = 'NGUYEN VIET CHINH';
    const transferContent = `DIETDELI ${subscription.id}`;
    const amount = mealPackage.price;
    const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      transferContent,
    )}&accountName=${encodeURIComponent(accountName)}`;

    return {
      message: 'Đặt gói thành công. Vui lòng chuyển khoản để kích hoạt gói ăn.',
      subscription,
      paymentInstructions: {
        method: 'BANK_TRANSFER',
        subscriptionId: subscription.id,
        packageName: mealPackage.name,
        calories: mealPackage.caloriesPerMeal,
        amount,
        bankAccount,
        bankCode,
        accountName,
        transferContent,
        qrUrl,
        orderId: subscription.id,
        note: 'Gói ăn sẽ được kích hoạt sau khi quản trị viên xác nhận chuyển khoản thành công.',
      },
    };
  }

  // 2. ADMIN CẬP NHẬT TRẠNG THÁI THANH TOÁN (ĐÁNH DẤU PAID / UNPAID / CANCELLED)
  async updatePaymentStatus(subscriptionId: number, status: 'PAID' | 'UNPAID' | 'CANCELLED') {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException(`Không tìm thấy đơn đăng ký gói #${subscriptionId}`);
    }

    const updated = await this.prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { paymentStatus: status },
      include: { package: true },
    });

    return {
      message: `Đã cập nhật trạng thái đơn #${subscriptionId} sang ${status}`,
      subscription: updated,
    };
  }

  // 3. LẤY DANH SÁCH GÓI CỦA USER ĐANG ĐĂNG NHẬP
  async getUserSubscriptions(userId: number) {
    return this.prisma.userSubscription.findMany({
      where: { idUser: userId },
      include: {
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 4. LẤY TẤT CẢ ĐƠN ĐĂNG KÝ (Dành cho Admin duyệt đơn)
  async getAllSubscriptions() {
    return this.prisma.userSubscription.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
