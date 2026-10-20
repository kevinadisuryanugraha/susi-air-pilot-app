import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../data-store/data-store.service.js';

export interface DocumentResponseItem {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'safe' | 'soon' | 'expired';
  badgeColor: string; // Hex color: Green, Amber, Red
  statusLabel: string;
}

export interface DocumentsResponse {
  today: string;
  warningDaysThreshold: number;
  documents: DocumentResponseItem[];
}

@Injectable()
export class DocumentsService {
  constructor(private readonly dataStoreService: DataStoreService) {}

  getDocuments(): DocumentsResponse {
    const rawData = this.dataStoreService.getDocuments();
    const todayStr = this.dataStoreService.getToday(); // '2026-05-15'
    const today = this.parseDate(todayStr);
    const warningDays = rawData.thresholds.warningDays || 30;

    const items: DocumentResponseItem[] = rawData.documents.map((doc) => {
      const expDate = this.parseDate(doc.expiryDate);
      const diffTime = expDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status: DocumentResponseItem['status'] = 'safe';
      let badgeColor = '#1FBF8F'; // Success green
      let statusLabel = `${daysRemaining} days left`;

      if (daysRemaining <= 0) {
        status = 'expired';
        badgeColor = '#E63757'; // Danger red
        statusLabel = daysRemaining === 0 ? 'Expires today' : `Expired ${Math.abs(daysRemaining)} days ago`;
      } else if (daysRemaining <= warningDays) {
        status = 'soon';
        badgeColor = '#F59E0B'; // Warning amber
        statusLabel = `Expires in ${daysRemaining} days`;
      }

      return {
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        daysRemaining,
        status,
        badgeColor,
        statusLabel,
      };
    });

    return {
      today: todayStr,
      warningDaysThreshold: warningDays,
      documents: items,
    };
  }

  private parseDate(str: string): Date {
    const [year, month, day] = str.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }
}
