import { Injectable } from '@nestjs/common';
import { DataStoreService, FlightHourEntry } from '../data-store/data-store.service.js';
import { AVIATION_CONSTANTS, ChartRange } from '../common/constants/aviation.constants.js';

export interface LimitCard {
  type: 'daily' | 'weekly' | 'monthly' | 'annual';
  label: string;
  limit: number;
  currentHours: number;
  percentage: number;
  remainingHours: number;
  isExceeded: boolean;
  status: 'safe' | 'warning' | 'danger';
  windowDescription: string;
}

export interface ChartSeriesPoint {
  date: string;
  formattedDate: string;
  rollingSum: number;
  dailyHours: number;
  isToday: boolean;
  isExceeded: boolean;
}

export interface FlightHoursSummaryResponse {
  today: string;
  selectedRange: ChartRange;
  cards: LimitCard[];
  chart: {
    range: ChartRange;
    limitLine: number;
    yAxisMax: number;
    windowDays: number;
    displayRangeDays: number;
    series: ChartSeriesPoint[];
  };
}

@Injectable()
export class FlightHoursService {
  constructor(private readonly dataStoreService: DataStoreService) {}

  getFlightHours(from?: string, to?: string): FlightHourEntry[] {
    return this.dataStoreService.getFlightHoursInRange(from, to);
  }

  // this is a rolling sum calculation :)
  rollingWindowBluffing(range: ChartRange = '1w'): FlightHoursSummaryResponse {
    const todayStr = this.dataStoreService.getToday(); // '2026-05-15'
    const todayDate = this.parseDate(todayStr);

    // 1. Calculate 4 Regulatory Limit Cards
    const dailyHours = this.calculateRollingSum(todayDate, 1);
    const weeklyHours = this.calculateRollingSum(todayDate, 7);
    const monthlyHours = this.calculateRollingSum(todayDate, 30);
    const annualHours = this.calculateRollingSum(todayDate, 365);

    const limits = AVIATION_CONSTANTS.REGULATORY_LIMITS;

    const cards: LimitCard[] = [
      this.buildCard('daily', 'Daily Limit', limits.daily, dailyHours, 'Today only'),
      this.buildCard('weekly', 'Weekly Limit', limits.weekly, weeklyHours, 'Rolling 7 days'),
      this.buildCard('monthly', 'Monthly Limit', limits.monthly, monthlyHours, 'Rolling 30 days'),
      this.buildCard('annual', 'Annual Limit', limits.annual, annualHours, 'Rolling 365 days'),
    ];

    // 2. Calculate Chart Series
    // X-axis: 7 days before today, today, 7 days after today (15 points total, today centered)
    const bounds = AVIATION_CONSTANTS.CHART_BOUNDS[range] || AVIATION_CONSTANTS.CHART_BOUNDS['1w'];
    const windowDays = bounds.windowDays;
    const series: ChartSeriesPoint[] = [];

    for (let offset = -7; offset <= 7; offset++) {
      const targetDate = this.addDays(todayDate, offset);
      const targetDateStr = this.formatDate(targetDate);
      const rollingSum = this.calculateRollingSum(targetDate, windowDays);
      const daily = this.dataStoreService.getHoursForDate(targetDateStr);
      const isToday = offset === 0;
      const isExceeded = rollingSum > bounds.limit;

      series.push({
        date: targetDateStr,
        formattedDate: this.formatDisplayDate(targetDate),
        rollingSum: Number(rollingSum.toFixed(2)),
        dailyHours: Number(daily.toFixed(2)),
        isToday,
        isExceeded,
      });
    }

    return {
      today: todayStr,
      selectedRange: range,
      cards,
      chart: {
        range,
        limitLine: bounds.limit,
        yAxisMax: bounds.max,
        windowDays: bounds.windowDays,
        displayRangeDays: bounds.displayRangeDays,
        series,
      },
    };
  }

  /**
   * Calculates the rolling sum of flight hours for the given window ending on targetDate.
   * Days with 0 hours contribute 0. Missing dates contribute 0.
   */
  private calculateRollingSum(targetDate: Date, windowDays: number): number {
    let total = 0;
    for (let i = 0; i < windowDays; i++) {
      const day = this.addDays(targetDate, -i);
      const dayStr = this.formatDate(day);
      const hours = this.dataStoreService.getHoursForDate(dayStr);
      total += hours;
    }
    return Number(total.toFixed(2));
  }

  private buildCard(
    type: LimitCard['type'],
    label: string,
    limit: number,
    currentHours: number,
    windowDescription: string,
  ): LimitCard {
    const remainingHours = Number(Math.max(0, limit - currentHours).toFixed(2));
    const percentage = Number(((currentHours / limit) * 100).toFixed(1));
    const isExceeded = currentHours > limit;

    let status: LimitCard['status'] = 'safe';
    if (isExceeded || percentage >= 95) {
      status = 'danger';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return {
      type,
      label,
      limit,
      currentHours: Number(currentHours.toFixed(2)),
      percentage,
      remainingHours,
      isExceeded,
      status,
      windowDescription,
    };
  }

  private parseDate(str: string): Date {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private formatDate(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private formatDisplayDate(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = date.getUTCDate();
    const m = months[date.getUTCMonth()];
    return `${d} ${m}`;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }
}
