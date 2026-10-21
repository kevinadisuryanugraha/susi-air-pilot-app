import { Body, Controller, Get, Post } from '@nestjs/common';
import { LogbookService } from './logbook.service.js';
import { CreateLogbookDto } from './dto/create-logbook.dto.js';

@Controller('logbook')
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Get()
  getLogbooks() {
    return this.logbookService.getLogbooks();
  }

  @Post()
  createLogbook(@Body() createLogbookDto: CreateLogbookDto) {
    return this.logbookService.createLogbook(createLogbookDto);
  }
}
