import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FlightHoursService } from './flight-hours.service.js';
import { GetFlightHoursDto } from './dto/get-flight-hours.dto.js';
import { GetSummaryDto } from './dto/get-summary.dto.js';

@ApiTags('Flight Hours')
@ApiBearerAuth('JWT-auth')
@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Calculate 15-day rolling sum series and 4 CASR limit cards (Server-Side)',
  })
  @ApiResponse({ status: 200, description: 'Rolling sum trend series and 4 limit cards' })
  getSummary(@Query() query: GetSummaryDto) {
    return this.flightHoursService.rollingWindowBluffing(query.range);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve daily flight hours within a specific date range' })
  @ApiResponse({ status: 200, description: 'Array of daily flight hour records' })
  getFlightHours(@Query() query: GetFlightHoursDto) {
    return this.flightHoursService.getFlightHours(query.from, query.to);
  }
}
