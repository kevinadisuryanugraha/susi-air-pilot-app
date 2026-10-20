import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursService } from './flight-hours.service.js';
import { GetFlightHoursDto } from './dto/get-flight-hours.dto.js';
import { GetSummaryDto } from './dto/get-summary.dto.js';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get('summary')
  getSummary(@Query() query: GetSummaryDto) {
    return this.flightHoursService.rollingWindowBluffing(query.range);
  }

  @Get()
  getFlightHours(@Query() query: GetFlightHoursDto) {
    return this.flightHoursService.getFlightHours(query.from, query.to);
  }
}
