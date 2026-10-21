import { describe, it, expect, beforeEach } from 'vitest';
import { LogbookService } from './logbook.service.js';
import { DataStoreService } from '../data-store/data-store.service.js';

describe('LogbookService', () => {
  let service: LogbookService;
  let dataStore: DataStoreService;

  beforeEach(() => {
    dataStore = new DataStoreService();
    dataStore.onModuleInit();
    service = new LogbookService(dataStore);
  });

  it('should return initial seeded logbook entries and stats', () => {
    const res = service.getLogbooks();
    expect(res.entries.length).toBeGreaterThan(0);
    expect(res.stats.totalFlights).toBe(res.entries.length);
    expect(res.stats.totalHours).toBeGreaterThan(0);
    expect(res.stats.totalLandings).toBeGreaterThan(0);
  });

  it('should record a new flight leg and update totals', () => {
    const initialHours = dataStore.getPilotProfile().totalFlightHours;

    const newLeg = service.createLogbook({
      date: '2026-05-15',
      flightNumber: 'SI-999',
      aircraft: 'PK-VVP (C208B)',
      origin: 'CJN',
      destination: 'HLP',
      offBlock: '14:00',
      onBlock: '15:15',
      flightHours: 1.25,
      landings: 1,
      pilotRole: 'PIC',
      remarks: 'Test check flight',
    });

    expect(newLeg.id).toBeDefined();
    expect(newLeg.flightNumber).toBe('SI-999');

    // Pilot total flight hours should be incremented
    const updatedHours = dataStore.getPilotProfile().totalFlightHours;
    expect(updatedHours).toBe(Number((initialHours + 1.25).toFixed(2)));

    // Logbook list should contain the new entry
    const list = service.getLogbooks();
    expect(list.entries[0].flightNumber).toBe('SI-999');
  });
});
