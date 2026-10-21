import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service.js';
import { GetSchedulesDto } from './dto/get-schedules.dto.js';

@ApiTags('Schedules')
@ApiBearerAuth('JWT-auth')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('weather')
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @ApiOperation({ summary: 'Fetch live METAR weather briefing for an airport base code' })
  @ApiResponse({ status: 200, description: 'METAR raw string and decoded wind/vis/temp/QNH' })
  getWeather(@Query('airport') airport: string) {
    return this.schedulesService.getWeather(airport || 'CJN');
  }

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @ApiOperation({
    summary: 'Retrieve monthly pilot flight schedule entries and duty type legend',
  })
  @ApiResponse({ status: 200, description: 'Monthly schedules with completion status & legend' })
  getSchedules(@Query() query: GetSchedulesDto) {
    return this.schedulesService.getSchedules(query.year, query.month);
  }
}
