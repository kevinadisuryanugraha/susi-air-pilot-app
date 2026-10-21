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

export interface LogbookEntry {
  id: string;
  date: string;
  flightNumber: string;
  aircraft: string;
  origin: string;
  destination: string;
  offBlock: string;
  onBlock: string;
  flightHours: number;
  landings: number;
  pilotRole: 'PIC' | 'SIC';
  remarks?: string;
  createdAt: string;
}

export interface AirportWeatherMetar {
  icao: string;
  name: string;
  metarRaw: string;
  wind: string;
  visibility: string;
  temperature: string;
  altimeterQnh: string;
  condition: 'VFR' | 'MVFR' | 'IFR';
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
  private logbookEntries: LogbookEntry[] = [
    {
      id: 'log_9001',
      date: '2026-05-15',
      flightNumber: 'SI-201',
      aircraft: 'PK-VVP (C208B)',
      origin: 'CJN',
      destination: 'HLP',
      offBlock: '06:30',
      onBlock: '07:45',
      flightHours: 1.25,
      landings: 1,
      pilotRole: 'PIC',
      remarks: 'Scheduled passenger shuttle, weather clear',
      createdAt: '2026-05-15T08:00:00.000Z',
    },
    {
      id: 'log_9002',
      date: '2026-05-15',
      flightNumber: 'SI-202',
      aircraft: 'PK-VVP (C208B)',
      origin: 'HLP',
      destination: 'CJN',
      offBlock: '09:15',
      onBlock: '10:30',
      flightHours: 1.25,
      landings: 1,
      pilotRole: 'PIC',
      remarks: 'Return shuttle, smooth landing runway 07',
      createdAt: '2026-05-15T11:00:00.000Z',
    },
    {
      id: 'log_9003',
      date: '2026-05-14',
      flightNumber: 'SI-188',
      aircraft: 'PK-VVF (C208B)',
      origin: 'MKW',
      destination: 'SOQ',
      offBlock: '07:00',
      onBlock: '08:40',
      flightHours: 1.67,
      landings: 1,
      pilotRole: 'PIC',
      remarks: 'Cargo and medical supply dispatch',
      createdAt: '2026-05-14T09:00:00.000Z',
    },
    {
      id: 'log_9004',
      date: '2026-05-14',
      flightNumber: 'SI-189',
      aircraft: 'PK-VVF (C208B)',
      origin: 'SOQ',
      destination: 'MKW',
      offBlock: '11:00',
      onBlock: '12:45',
      flightHours: 1.75,
      landings: 1,
      pilotRole: 'PIC',
      remarks: 'VFR coastal flight leg',
      createdAt: '2026-05-14T13:00:00.000Z',
    },
    {
      id: 'log_9005',
      date: '2026-05-13',
      flightNumber: 'SI-145',
      aircraft: 'PK-VVN (Piaggio P180)',
      origin: 'PDG',
      destination: 'BKS',
      offBlock: '08:00',
      onBlock: '09:30',
      flightHours: 1.5,
      landings: 1,
      pilotRole: 'PIC',
      remarks: 'Executive charter flight',
      createdAt: '2026-05-13T10:00:00.000Z',
    },
  ];
  private pilotData: {
    name: string;
    totalFlightHours: number;
    avatarUrl: string;
  } = {
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
        path.resolve(currentDir, '../src/data'),
        path.resolve(currentDir, './data'),
        path.resolve(process.cwd(), 'src/data'),
        path.resolve(process.cwd(), 'nest/src/data'),
        path.resolve(process.cwd(), 'dist/data'),
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

  getLogbooks(): LogbookEntry[] {
    return [...this.logbookEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  addLogbookEntry(data: {
    date: string;
    flightNumber: string;
    aircraft: string;
    origin: string;
    destination: string;
    offBlock: string;
    onBlock: string;
    flightHours: number;
    landings: number;
    pilotRole?: 'PIC' | 'SIC';
    remarks?: string;
  }): LogbookEntry {
    const entry: LogbookEntry = {
      id: `log_${Date.now()}`,
      date: data.date,
      flightNumber: data.flightNumber,
      aircraft: data.aircraft,
      origin: data.origin.toUpperCase(),
      destination: data.destination.toUpperCase(),
      offBlock: data.offBlock,
      onBlock: data.onBlock,
      flightHours: Number(data.flightHours.toFixed(2)),
      landings: data.landings,
      pilotRole: data.pilotRole || 'PIC',
      remarks: data.remarks || '',
      createdAt: new Date().toISOString(),
    };

    this.logbookEntries.unshift(entry);

    // Update daily hours map & pilot total hours
    const currentDayHours = this.flightHoursMap.get(entry.date) || 0;
    this.flightHoursMap.set(entry.date, Number((currentDayHours + entry.flightHours).toFixed(2)));
    this.pilotData.totalFlightHours = Number(
      (this.pilotData.totalFlightHours + entry.flightHours).toFixed(2),
    );

    // Also increment schedule logbook count if a schedule exists on that day
    const matchingSched = this.schedules.find((s) => s.duty_date === entry.date);
    if (matchingSched) {
      matchingSched.count_logbooks += 1;
    }

    return entry;
  }

  getAirportWeather(iata: string): AirportWeatherMetar {
    const weatherDb: Record<string, AirportWeatherMetar> = {
      CJN: {
        icao: 'WI1A',
        name: 'Cijulang Nusawiru Airport',
        metarRaw: 'WI1A 150700Z 12008KT 9999 FEW018 29/24 Q1010 NOSIG',
        wind: '120° at 8 kt',
        visibility: '10+ km',
        temperature: '29°C (Dewpoint 24°C)',
        altimeterQnh: '1010 hPa',
        condition: 'VFR',
      },
      HLP: {
        icao: 'WIHH',
        name: 'Halim Perdanakusuma Intl',
        metarRaw: 'WIHH 150700Z 09006KT 8000 SCT020 31/23 Q1009 NOSIG',
        wind: '090° at 6 kt',
        visibility: '8 km',
        temperature: '31°C (Dewpoint 23°C)',
        altimeterQnh: '1009 hPa',
        condition: 'VFR',
      },
      MKW: {
        icao: 'WAUU',
        name: 'Rendani Airport (Manokwari)',
        metarRaw: 'WAUU 150700Z 18010KT 9999 BKN025 30/25 Q1008 NOSIG',
        wind: '180° at 10 kt',
        visibility: '10+ km',
        temperature: '30°C (Dewpoint 25°C)',
        altimeterQnh: '1008 hPa',
        condition: 'VFR',
      },
      SOQ: {
        icao: 'WASS',
        name: 'Domine Eduard Osok (Sorong)',
        metarRaw: 'WASS 150700Z 21008KT 9000 FEW020 29/24 Q1009 NOSIG',
        wind: '210° at 8 kt',
        visibility: '9 km',
        temperature: '29°C (Dewpoint 24°C)',
        altimeterQnh: '1009 hPa',
        condition: 'VFR',
      },
      PDG: {
        icao: 'WIPT',
        name: 'Minangkabau Intl (Padang)',
        metarRaw: 'WIPT 150700Z 34005KT 9999 SCT018 30/24 Q1010 NOSIG',
        wind: '340° at 5 kt',
        visibility: '10+ km',
        temperature: '30°C (Dewpoint 24°C)',
        altimeterQnh: '1010 hPa',
        condition: 'VFR',
      },
    };

    return (
      weatherDb[iata.toUpperCase()] || {
        icao: `WI${iata.toUpperCase()}`,
        name: `${iata.toUpperCase()} Airstrip`,
        metarRaw: `WIX 150700Z VRB04KT 9999 CAVOK 28/22 Q1010`,
        wind: 'Variable at 4 kt',
        visibility: '10 km (CAVOK)',
        temperature: '28°C',
        altimeterQnh: '1010 hPa',
        condition: 'VFR',
      }
    );
  }
}
