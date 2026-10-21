import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../data-store/data-store.service.js';

export interface ScheduleItemResponse {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
  isCompleted: boolean;
  remainingDuties: number;
}

export interface SchedulesResponse {
  year: string;
  month: string;
  today: string;
  schedules: ScheduleItemResponse[];
  legend: Array<{ code: string; label: string; color: string }>;
}

@Injectable()
export class SchedulesService {
  constructor(private readonly dataStoreService: DataStoreService) {}

  getSchedules(year?: string, month?: string): SchedulesResponse {
    const todayStr = this.dataStoreService.getToday(); // '2026-05-15'
    const [defYear, defMonth] = todayStr.split('-');

    const queryYear = year || defYear;
    const queryMonth = month ? month.padStart(2, '0') : defMonth;

    const { schedules, legend } = this.dataStoreService.getSchedules(queryYear, queryMonth);

    const mapped = schedules.map((item) => {
      const isCompleted = item.count_logbooks >= item.count_schedules && item.count_schedules > 0;
      const remainingDuties = Math.max(0, item.count_schedules - item.count_logbooks);

      return {
        id: item.id,
        duty_date: item.duty_date,
        status: item.status,
        base_name: item.base_name,
        base_color: item.base_color,
        duty_type: item.duty_type,
        count_schedules: item.count_schedules,
        count_logbooks: item.count_logbooks,
        isCompleted,
        remainingDuties,
      };
    });

    return {
      year: queryYear,
      month: queryMonth,
      today: todayStr,
      schedules: mapped,
      legend,
    };
  }

  getWeather(airport: string) {
    return this.dataStoreService.getAirportWeather(airport);
  }
}
