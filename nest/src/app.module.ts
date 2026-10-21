import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { DataStoreModule } from './data-store/data-store.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PilotModule } from './pilot/pilot.module.js';
import { FlightHoursModule } from './flight-hours/flight-hours.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { SchedulesModule } from './schedules/schedules.module.js';
import { LogbookModule } from './logbook/logbook.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

import { AppController } from './app.controller.js';

@Module({
  imports: [
    DataStoreModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
    LogbookModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
