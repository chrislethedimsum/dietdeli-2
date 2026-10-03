import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  // 1. Hàm tạo cặp Tokens (Access Token: 15m, Refresh Token: 7d)
  private async generateTokens(user: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
    // Access Token: 15 phút
    const accessToken = this.jwtService.sign(payload, {
      secret:
        process.env.JWT_ACCESS_SECRET || 'dietdeli_access_secret_key_15m_2026',
      expiresIn: '15m', // 👈 15 phút
    });
    // Refresh Token: 7 ngày
    const refreshToken = this.jwtService.sign(
      { sub: user.id }, // Refresh payload chỉ cần chứa user id
      {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          'dietdeli_refresh_secret_key_7d_2026',
        expiresIn: '7d', // 👈 7 ngày
      },
    );
    return { accessToken, refreshToken };
  }

  // 2. ĐĂNG KÝ
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // 1. Tạo User
    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: email,
        password: hashedPassword,
        phone: dto.phone,
        address: dto.address || null,
        // 👉 Lưu chỉ số sức khoẻ vào hồ sơ khách hàng:
        gender: dto.gender || null,
        height: dto.height ? Number(dto.height) : null,
        weight: dto.weight ? Number(dto.weight) : null,
        goal: dto.goal || null,
      },
    });

    // 2. Tìm gói ăn tương ứng trong Database và tạo Subscription (nếu có chọn gói)
    let subscriptionData: any = null;
    let paymentInstructions: any = null;
    if (dto.packageType && dto.calories) {
      // Ánh xạ tên: 'ngay' -> 'Ngày', 'tuan' -> 'Tuần', 'thang' -> 'Tháng'
      const typeMap: Record<string, string> = {
        ngay: 'Ngày',
        tuan: 'Tuần',
        thang: 'Tháng',
      };
      const typeName = typeMap[dto.packageType] || 'Tuần';
      const meals = dto.mealOption === '1_meal' ? 1 : 2;
      const targetName = `${typeName} ${meals} Bữa`; // Khớp với DB: "Tuần 2 Bữa", "Ngày 1 Bữa"...
      // Tìm gói trong bảng meal_package
      let mealPackage = await this.prisma.mealPackage.findFirst({
        where: {
          name: targetName,
          caloriesPerMeal: dto.calories,
          isActive: true,
        },
      });
      // Dự phòng nếu không tìm thấy chính xác thì lấy gói cùng tên
      if (!mealPackage) {
        mealPackage = await this.prisma.mealPackage.findFirst({
          where: { name: targetName },
        });
      }
      if (mealPackage) {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + mealPackage.durationDays);
        // Tạo bản ghi UserSubscription
        const sub = await this.prisma.userSubscription.create({
          data: {
            idUser: newUser.id,
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
        subscriptionData = sub;
        // Cấu hình thông tin chuyển khoản VietQR
        const bankAccount = '0389150399';
        const bankCode = 'MB'; // MBBank
        const accountName = 'NGUYEN VIET CHINH';
        const transferContent = `DIETDELI ${sub.id}`;
        const amount = mealPackage.price;

        // Link sinh QR động chuẩn VietQR
        const qrUrl = `https://img.vietqr.io/image/${bankCode}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
        paymentInstructions = {
          subscriptionId: sub.id,
          packageName: mealPackage.name,
          calories: mealPackage.caloriesPerMeal,
          amount,
          bankAccount,
          bankCode,
          accountName,
          transferContent,
          qrUrl,
        };
      }
    }

    // 3. Tự động sinh Token đăng nhập cho khách
    const tokens = await this.generateTokens(newUser);
    await this.prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken: tokens.refreshToken },
    });
    const { password: _p, refreshToken: _r, ...userInfo } = newUser;
    return {
      message: 'Đăng ký tài khoản và đặt gói ăn thành công',
      ...tokens,
      user: userInfo,
      subscription: subscriptionData,
      paymentInstructions,
    };
  }

  // 3. ĐĂNG NHẬP
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    // Tạo cả 2 token
    const tokens = await this.generateTokens(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });
    return {
      message: 'Đăng nhập thành công',
      ...tokens, // { accessToken, refreshToken }
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        isAdmin: user.isAdmin,
      },
    };
  }

  // 3. Hàm REFRESH TOKEN (Cấp lại Access Token mới khi cái cũ hết hạn)
  async refreshAccessToken(refreshToken: string) {
    try {
      // Xác thực Refresh Token với Secret của nó
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          'dietdeli_refresh_secret_key_7d_2026',
      });
      // Lấy thông tin user từ database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      // Nếu user đã logout (refreshToken trong DB là null) hoặc token không khớp -> Chặn ngay!
      if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException(
          'Phiên đăng nhập đã kết thúc hoặc không hợp lệ',
        );
      }
      // Cấp Access Token mới (15 phút)
      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        },
        {
          secret:
            process.env.JWT_ACCESS_SECRET ||
            'dietdeli_access_secret_key_15m_2026',
          expiresIn: '15m',
        },
      );
      return {
        accessToken: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException(
        'Refresh Token không hợp lệ hoặc đã hết hạn (quá 7 ngày)',
      );
    }
  }

  // server/src/auth/auth.service.ts
  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }, // 👈 Xóa token ở backend
    });
    return { message: 'Đăng xuất thành công' };
  }

  // 4. Lấy thông tin user hiện tại
  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        gender: true,
        dob: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        isAdmin: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
    return user;
  }
}
