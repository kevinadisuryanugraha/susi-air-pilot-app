import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service.js';

@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60, stale-while-revalidate=300')
  @ApiOperation({
    summary: 'Retrieve pilot license and medical documents with dynamic urgency status',
  })
  @ApiResponse({ status: 200, description: 'List of documents with safe/soon/expired badges' })
  getDocuments() {
    return this.documentsService.getDocuments();
  }
}
