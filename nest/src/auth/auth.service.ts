import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
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

    const isUserValid = this.timingSafeCompare(username, hardcoded.username);
    const isPassValid = this.timingSafeCompare(password, hardcoded.password);

    if (!isUserValid || !isPassValid) {
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
      accessToken: token,
      pilot: {
        name: pilot.name,
        totalFlightHours: pilot.totalFlightHours,
        avatarUrl: pilot.avatarUrl,
      },
    };
  }

  /**
   * Constant-time string comparison to prevent timing side-channel attacks (CWE-208)
   */
  private timingSafeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    if (bufA.length !== bufB.length) {
      // Execute dummy comparison to maintain uniform latency
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  }
}
