import { describe, it, expect, beforeEach } from 'vitest';
import { SchedulesService } from './schedules.service.js';
import { DataStoreService } from '../data-store/data-store.service.js';

describe('SchedulesService', () => {
  let service: SchedulesService;
  let dataStore: DataStoreService;

  beforeEach(() => {
    dataStore = new DataStoreService();
    dataStore.onModuleInit();
    service = new SchedulesService(dataStore);
  });

  it('should return schedules and legend for May 2026', () => {
    const res = service.getSchedules('2026', '05');
    expect(res.year).toBe('2026');
    expect(res.month).toBe('05');
    expect(res.schedules.length).toBeGreaterThan(0);
    expect(res.legend.length).toBeGreaterThan(0);

    const onDutyLegend = res.legend.find((l) => l.code === 'DTY');
    expect(onDutyLegend?.color).toBe('#10B981');

    // Check duty status indicator logic
    const day15 = res.schedules.find((s) => s.duty_date === '2026-05-15');
    expect(day15?.isCompleted).toBe(true);
    expect(day15?.remainingDuties).toBe(0);

    const day19 = res.schedules.find((s) => s.duty_date === '2026-05-19');
    expect(day19?.isCompleted).toBe(false);
    expect(day19?.remainingDuties).toBe(2);
  });
});
