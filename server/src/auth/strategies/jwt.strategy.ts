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

  async validate(payload: { sub: number; email: string; name: string }) {
    // Giá trị trả về ở đây sẽ được tự động gán vào req.user
    if (!payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    return { userId: payload.sub, email: payload.email, name: payload.name };
  }
}