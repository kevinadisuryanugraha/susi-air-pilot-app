import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';
import { DataStoreService } from '../data-store/data-store.service.js';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let dataStore: DataStoreService;

  beforeEach(() => {
    dataStore = new DataStoreService();
    dataStore.onModuleInit();
    jwtService = new JwtService({ secret: 'test-secret' });
    authService = new AuthService(jwtService, dataStore);
  });

  it('should authenticate valid pilot credentials', async () => {
    const result = await authService.login({
      username: 'johndoe',
      password: 'susiairtest',
    });
    expect(result.token).toBeDefined();
    expect(result.pilot.name).toBe('John Doe');
  });

  it('should reject invalid credentials with UnauthorizedException', async () => {
    await expect(
      authService.login({ username: 'johndoe', password: 'wrongpassword' }),
    ).rejects.toThrow(UnauthorizedException);

    await expect(
      authService.login({ username: 'random', password: 'susiairtest' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
