import { Injectable } from '@nestjs/common';
import { DataStoreService } from '../data-store/data-store.service.js';

@Injectable()
export class PilotService {
  constructor(private readonly dataStoreService: DataStoreService) {}

  getProfile() {
    return this.dataStoreService.getPilotProfile();
  }
}
