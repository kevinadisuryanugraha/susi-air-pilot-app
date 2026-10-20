import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';
import { AVIATION_CONSTANTS } from '../common/constants/aviation.constants.js';

export interface FlightHourEntry {
  date: string;
  hours: number;
}

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
}

export interface ScheduleEntry {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface ScheduleLegend {
  code: string;
  label: string;
  color: string;
}

@Injectable()
export class DataStoreService implements OnModuleInit {
  private readonly logger = new Logger(DataStoreService.name);

  private flightHours: FlightHourEntry[] = [];
  private flightHoursMap = new Map<string, number>();
  private documents: PilotDocument[] = [];
  private documentThresholds: { warningDays: number } = { warningDays: 30 };
  private schedules: ScheduleEntry[] = [];
  private scheduleLegend: ScheduleLegend[] = [];
  private pilotData = {
    name: AVIATION_CONSTANTS.HARDCODED_PILOT.name,
    totalFlightHours: AVIATION_CONSTANTS.HARDCODED_PILOT.totalFlightHours,
    avatarUrl: AVIATION_CONSTANTS.HARDCODED_PILOT.avatarUrl,
  };

  onModuleInit() {
    this.loadData();
  }

  private loadData() {
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      // Look for data files in src/data or dist/data or relative paths
      const possibleDirs = [
        path.resolve(currentDir, '../data'),
        path.resolve(currentDir, '../../src/data'),
        path.resolve(process.cwd(), 'src/data'),
        path.resolve(process.cwd(), 'nest/src/data'),
      ];

      let dataDir = possibleDirs.find((dir) =>
        fs.existsSync(path.join(dir, 'mock-flight-hours.json')),
      );

      if (!dataDir) {
        throw new Error(
          `Could not locate data directory containing mock-flight-hours.json. Searched: ${possibleDirs.join(', ')}`,
        );
      }

      this.logger.log(`Loading mock data from: ${dataDir}`);

      // 1. Flight hours
      const flightHoursRaw = fs.readFileSync(
        path.join(dataDir, 'mock-flight-hours.json'),
        'utf-8',
      );
      const flightHoursJson = JSON.parse(flightHoursRaw);
      this.flightHours = flightHoursJson.flightHours || [];
      if (flightHoursJson.pilot) {
        this.pilotData.name = flightHoursJson.pilot.name || this.pilotData.name;
        this.pilotData.totalFlightHours =
          flightHoursJson.pilot.totalFlightHours || this.pilotData.totalFlightHours;
      }
      for (const entry of this.flightHours) {
        this.flightHoursMap.set(entry.date, entry.hours);
      }

      // 2. Documents
      const docsRaw = fs.readFileSync(
        path.join(dataDir, 'mock-documents.json'),
        'utf-8',
      );
      const docsJson = JSON.parse(docsRaw);
      this.documents = docsJson.documents || [];
      if (docsJson.thresholds?.warningDays) {
        this.documentThresholds.warningDays = docsJson.thresholds.warningDays;
      }

      // 3. Schedules
      const schedulesRaw = fs.readFileSync(
        path.join(dataDir, 'mock-schedules.json'),
        'utf-8',
      );
      const schedulesJson = JSON.parse(schedulesRaw);
      this.schedules = schedulesJson.schedules || [];
      this.scheduleLegend = schedulesJson.legend || [];

      this.logger.log(
        `Successfully seeded data store: ${this.flightHours.length} flight days, ${this.documents.length} documents, ${this.schedules.length} schedules`,
      );
    } catch (error) {
      this.logger.error('Failed to load mock data:', error);
      throw error;
    }
  }

  getToday(): string {
    return AVIATION_CONSTANTS.DEFAULT_TODAY;
  }

  getPilotProfile() {
    return {
      ...this.pilotData,
    };
  }

  getAllFlightHours(): FlightHourEntry[] {
    return this.flightHours;
  }

  getFlightHoursInRange(from?: string, to?: string): FlightHourEntry[] {
    return this.flightHours.filter((entry) => {
      if (from && entry.date < from) return false;
      if (to && entry.date > to) return false;
      return true;
    });
  }

  getHoursForDate(date: string): number {
    return this.flightHoursMap.get(date) ?? 0;
  }

  getLimits() {
    return AVIATION_CONSTANTS.REGULATORY_LIMITS;
  }

  getChartBounds() {
    return AVIATION_CONSTANTS.CHART_BOUNDS;
  }

  getDocuments() {
    return {
      thresholds: this.documentThresholds,
      documents: this.documents,
    };
  }

  getSchedules(year?: string, month?: string): { schedules: ScheduleEntry[]; legend: ScheduleLegend[] } {
    let filtered = this.schedules;
    if (year && month) {
      const formattedMonth = month.padStart(2, '0');
      const prefix = `${year}-${formattedMonth}`;
      filtered = this.schedules.filter((s) => s.duty_date.startsWith(prefix));
    } else if (year) {
      filtered = this.schedules.filter((s) => s.duty_date.startsWith(year));
    }
    return {
      schedules: filtered,
      legend: this.scheduleLegend,
    };
  }
}
