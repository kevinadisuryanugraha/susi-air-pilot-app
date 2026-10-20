import { describe, it, expect, beforeEach } from 'vitest';
import { DocumentsService } from './documents.service.js';
import { DataStoreService } from '../data-store/data-store.service.js';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let dataStore: DataStoreService;

  beforeEach(() => {
    dataStore = new DataStoreService();
    dataStore.onModuleInit();
    service = new DocumentsService(dataStore);
  });

  it('should calculate document urgency statuses correctly relative to 2026-05-15', () => {
    const res = service.getDocuments();
    expect(res.today).toBe('2026-05-15');
    expect(res.documents).toHaveLength(5);

    const expired = res.documents.find((d) => d.id === 'doc_security');
    expect(expired?.status).toBe('expired');
    expect(expired?.badgeColor).toBe('#E63757');

    const soon = res.documents.find((d) => d.id === 'doc_license');
    expect(soon?.status).toBe('soon');
    expect(soon?.badgeColor).toBe('#F59E0B');

    const safe = res.documents.find((d) => d.id === 'doc_recurrent');
    expect(safe?.status).toBe('safe');
    expect(safe?.badgeColor).toBe('#1FBF8F');
  });
});
