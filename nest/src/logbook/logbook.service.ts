import { Injectable } from '@nestjs/common';
import { DataStoreService, LogbookEntry } from '../data-store/data-store.service.js';
import { CreateLogbookDto } from './dto/create-logbook.dto.js';

export interface LogbookSummaryStats {
  totalFlights: number;
  totalHours: number;
  totalLandings: number;
  recentAircraft: string[];
}

export interface LogbookListResponse {
  stats: LogbookSummaryStats;
  entries: LogbookEntry[];
}

@Injectable()
export class LogbookService {
  constructor(private readonly dataStoreService: DataStoreService) {}

  getLogbooks(): LogbookListResponse {
    const entries = this.dataStoreService.getLogbooks();

    let totalHours = 0;
    let totalLandings = 0;
    const aircraftSet = new Set<string>();

    for (const e of entries) {
      totalHours += e.flightHours;
      totalLandings += e.landings;
      if (e.aircraft) aircraftSet.add(e.aircraft);
    }

    return {
      stats: {
        totalFlights: entries.length,
        totalHours: Number(totalHours.toFixed(2)),
        totalLandings,
        recentAircraft: Array.from(aircraftSet),
      },
      entries,
    };
  }

  createLogbook(dto: CreateLogbookDto): LogbookEntry {
    return this.dataStoreService.addLogbookEntry(dto);
  }
}
