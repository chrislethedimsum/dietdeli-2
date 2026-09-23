import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dietdeli_super_secret_jwt_key_2026',
    });
  }

  // src/auth/strategies/jwt.strategy.ts
  async validate(payload: { sub: number; email: string; name: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    return { 
      id: payload.sub,       // 👈 Chuẩn hóa thành id
      userId: payload.sub,   // Dự phòng nếu có code cũ dùng userId
      email: payload.email, 
      name: payload.name 
    };
  }
}