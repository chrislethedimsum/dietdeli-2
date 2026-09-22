import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { db } from '../prisma/db.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // 1. ĐĂNG KÝ
  async register(dto: RegisterDto) {
    // Tìm user bằng: db.orm.public.User.where(...).first()
    const existingUser = await db.orm.public.User
      .where({ email: dto.email })
      .first();

    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    // Băm mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    // Tạo user bằng: db.orm.public.User.create(...)
    const newUser = await db.orm.public.User.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      phone: dto.phone,
      address: dto.address || null,
    });

    const { password, ...result } = newUser;
    return {
      message: 'Đăng ký tài khoản thành công',
      user: result,
    };
  }

  // 2. ĐĂNG NHẬP
  async login(dto: LoginDto) {
    // Tìm user theo email
    const user = await db.orm.public.User
      .where({ email: dto.email })
      .first();

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // Sinh JWT Token
    const payload = { sub: user.id, email: user.email, name: user.name };
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
      },
    };
  }
}