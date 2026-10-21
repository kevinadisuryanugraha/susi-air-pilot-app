import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private static readonly tracker = new Map<string, RateLimitRecord>();
  private readonly defaultLimit = 120; // 120 reqs/min
  private readonly loginLimit = 15; // 15 login attempts/min
  private readonly windowMs = 60000;

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim())
      : req.socket?.remoteAddress || 'unknown';

    const path = req.url || '';
    const isLogin = path.includes('/auth/login');
    const limit = isLogin ? this.loginLimit : this.defaultLimit;

    const clientKey = `${ip}_${isLogin ? 'auth' : 'api'}`;
    const now = Date.now();

    const record = RateLimiterGuard.tracker.get(clientKey);

    if (!record || now > record.resetTime) {
      RateLimiterGuard.tracker.set(clientKey, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Security Rate Limit Exceeded. Too many requests, please try again shortly.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }
}
