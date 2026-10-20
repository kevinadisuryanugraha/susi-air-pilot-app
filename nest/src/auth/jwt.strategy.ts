import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AVIATION_CONSTANTS } from '../common/constants/aviation.constants.js';

export interface JwtPayload {
  sub: string;
  username: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AVIATION_CONSTANTS.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.username) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return {
      userId: payload.sub,
      username: payload.username,
      name: payload.name,
    };
  }
}
