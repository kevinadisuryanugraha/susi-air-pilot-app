import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AVIATION_CONSTANTS } from '../common/constants/aviation.constants.js';
import { LoginDto } from './dto/login.dto.js';
import { DataStoreService } from '../data-store/data-store.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataStoreService: DataStoreService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const hardcoded = AVIATION_CONSTANTS.HARDCODED_PILOT;

    if (username !== hardcoded.username || password !== hardcoded.password) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const pilot = this.dataStoreService.getPilotProfile();

    const payload = {
      sub: username,
      username: username,
      name: pilot.name,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      accessToken: token, // provide both for convenience
      pilot: {
        name: pilot.name,
        totalFlightHours: pilot.totalFlightHours,
        avatarUrl: pilot.avatarUrl,
      },
    };
  }
}
