import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LogbookService } from './logbook.service.js';
import { CreateLogbookDto } from './dto/create-logbook.dto.js';

@ApiTags('Logbook')
@ApiBearerAuth('JWT-auth')
@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all pilot flight logbook entries and flight aggregate statistics',
  })
  @ApiResponse({ status: 200, description: 'List of recorded flight legs and totals' })
  getLogbooks() {
    return this.logbookService.getLogbooks();
  }

  @Post()
  @ApiOperation({
    summary: 'Record new flight leg in EFB, automatically updating total flight hours',
  })
  @ApiResponse({ status: 201, description: 'Created flight leg record' })
  createLogbook(@Body() createLogbookDto: CreateLogbookDto) {
    return this.logbookService.createLogbook(createLogbookDto);
  }
}
