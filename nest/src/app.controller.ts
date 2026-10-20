import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator.js';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'susi-air-pilot-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get()
  getRoot() {
    return {
      name: 'Susi Air Pilot Operations API',
      status: 'online',
      version: '1.0.0',
    };
  }
}
