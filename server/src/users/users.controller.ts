import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ChangeMyPasswordDto } from './dto/update-password.dto.js';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyProfile(@Req() req: any) {
    return this.usersService.getMyProfile(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMyProfile(
    @Req() req: { user: { id: number } },
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.usersService.updateMyProfile(req.user.id, dto);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  async changeMyPassword(
    @Req() req: { user: { id: number } },
    @Body() dto: ChangeMyPasswordDto,
  ) {
    return this.usersService.changeMyPassword(req.user.id, dto);
  }
}
