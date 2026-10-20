import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service.js';
import { GetSchedulesDto } from './dto/get-schedules.dto.js';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  getSchedules(@Query() query: GetSchedulesDto) {
    return this.schedulesService.getSchedules(query.year, query.month);
  }
}
