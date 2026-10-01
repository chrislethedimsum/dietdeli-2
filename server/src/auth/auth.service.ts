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

  // 1. ĐĂNG KÝ
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

  // 2. ĐĂNG NHẬP
  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Đăng nhập thành công',
      accessToken,
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
}
