import { Controller, Get, Header, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { GetSchedulesDto } from './dto/get-schedules.dto.js';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('weather')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  getWeather(@Query('airport') airport: string) {
    return this.schedulesService.getWeather(airport || 'CJN');
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  getSchedules(@Query() query: GetSchedulesDto) {
    return this.schedulesService.getSchedules(query.year, query.month);
  }
}
