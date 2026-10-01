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

    const newUser = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: email,
        password: hashedPassword,
        phone: dto.phone,
        address: dto.address || null,
      },
    });

    const { password: _password, ...result } = newUser;
    return {
      message: 'Đăng ký tài khoản thành công',
      user: result,
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
}
