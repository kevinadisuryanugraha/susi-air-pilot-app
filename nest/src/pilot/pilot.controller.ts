import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PilotService } from './pilot.service.js';

@ApiTags('Pilot')
@ApiBearerAuth('JWT-auth')
@Controller('pilot')
export class PilotController {
  constructor(private readonly pilotService: PilotService) {}

  @Get('me')
  @ApiOperation({ summary: 'Retrieve logged-in pilot profile, total flight hours, and avatar' })
  @ApiResponse({ status: 200, description: 'Pilot profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile() {
    return this.pilotService.getProfile();
  }
}
