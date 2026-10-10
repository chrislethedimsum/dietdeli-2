import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { GetUserDto } from './dto/get-user.dto';
import bcrypt from 'bcryptjs';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';
import { ChangeMyPasswordDto } from './dto/update-password.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}
  async getMyProfile(userId: number): Promise<GetUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        address: true,
        gender: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return user;
  }

  async updateMyProfile(userId: number, dto: UpdateMyProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const data: {
      name?: string;
      phone?: string;
      dob?: Date | null;
      address?: string | null;
      gender?: string | null;
      height?: number | null;
      weight?: number | null;
      goal?: string | null;
      activityLevel?: string | null;
    } = {};

    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }

    if (dto.phone !== undefined) {
      data.phone = dto.phone.trim();
    }

    if (dto.dob !== undefined) {
      data.dob = dto.dob === null ? null : new Date(dto.dob);
    }

    if (dto.address !== undefined) {
      data.address = dto.address?.trim() || null;
    }

    if (dto.gender !== undefined) {
      data.gender = dto.gender;
    }

    if (dto.height !== undefined) {
      data.height = dto.height;
    }

    if (dto.weight !== undefined) {
      data.weight = dto.weight;
    }

    if (dto.goal !== undefined) {
      data.goal = dto.goal;
    }

    if (dto.activityLevel !== undefined) {
      data.activityLevel = dto.activityLevel;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        address: true,
        gender: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async changeMyPassword(userId: number, dto: ChangeMyPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Mật khẩu hiện tại không chính xác.');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'Mật khẩu mới phải khác mật khẩu hiện tại.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return {
      message: 'Đổi mật khẩu thành công.',
    };
  }
}
