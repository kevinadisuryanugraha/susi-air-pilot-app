import { describe, it, expect, beforeEach } from 'vitest';
import { FlightHoursService } from './flight-hours.service.js';
import { DataStoreService } from '../data-store/data-store.service.js';

describe('FlightHoursService', () => {
  let service: FlightHoursService;
  let dataStore: DataStoreService;

  beforeEach(() => {
    dataStore = new DataStoreService();
    dataStore.onModuleInit();
    service = new FlightHoursService(dataStore);
  });

  it('should be defined and calculate rollingWindowBluffing properly', () => {
    expect(service).toBeDefined();
    const summary = service.rollingWindowBluffing('1w');

    expect(summary.today).toBe('2026-05-15');
    expect(summary.selectedRange).toBe('1w');
    expect(summary.cards).toHaveLength(4);

    const [daily, weekly, monthly, annual] = summary.cards;
    expect(daily.limit).toBe(8);
    expect(daily.currentHours).toBe(6.4);

    expect(weekly.limit).toBe(40);
    expect(weekly.currentHours).toBe(25.2);

    expect(monthly.limit).toBe(100);
    expect(monthly.currentHours).toBe(87.2);

    expect(annual.limit).toBe(1050);
    expect(annual.currentHours).toBe(1013.8);

    // Chart series: 15 points
    expect(summary.chart.series).toHaveLength(15);
    // Index 7 is today (2026-05-15)
    expect(summary.chart.series[7].date).toBe('2026-05-15');
    expect(summary.chart.series[7].isToday).toBe(true);

    // Limit line and Y max for 1w
    expect(summary.chart.limitLine).toBe(40);
    expect(summary.chart.yAxisMax).toBe(45);
  });

  it('should properly update limit line and max when range changes', () => {
    const summary1m = service.rollingWindowBluffing('1m');
    expect(summary1m.chart.limitLine).toBe(100);
    expect(summary1m.chart.yAxisMax).toBe(125);

    const summary3m = service.rollingWindowBluffing('3m');
    expect(summary3m.chart.limitLine).toBe(300);
    expect(summary3m.chart.yAxisMax).toBe(325);

    const summary6m = service.rollingWindowBluffing('6m');
    expect(summary6m.chart.limitLine).toBe(600);
    expect(summary6m.chart.yAxisMax).toBe(625);

    const summary1y = service.rollingWindowBluffing('1y');
    expect(summary1y.chart.limitLine).toBe(1050);
    expect(summary1y.chart.yAxisMax).toBe(1200);
  });
});
