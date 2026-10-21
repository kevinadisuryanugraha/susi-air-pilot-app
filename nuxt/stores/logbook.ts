import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

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

export interface LogbookStats {
  totalFlights: number;
  totalHours: number;
  totalLandings: number;
  recentAircraft: string[];
}

export interface LogbookResponse {
  stats: LogbookStats;
  entries: LogbookEntry[];
}

export interface CreateLogbookPayload {
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
}

export const useLogbookStore = defineStore('logbook', () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const authStore = useAuthStore();

  const entries = ref<LogbookEntry[]>([]);
  const stats = ref<LogbookStats>({
    totalFlights: 0,
    totalHours: 0,
    totalLandings: 0,
    recentAircraft: [],
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchLogbooks() {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<LogbookResponse>(`${apiBase}/logbook`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      entries.value = data.entries;
      stats.value = data.stats;
    } catch (err: any) {
      if (err?.status === 401) {
        authStore.logout();
      } else {
        error.value = err?.data?.message || err?.message || 'Failed to load logbook entries';
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function createEntry(payload: CreateLogbookPayload): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const created = await $fetch<LogbookEntry>(`${apiBase}/logbook`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      entries.value.unshift(created);
      stats.value.totalFlights += 1;
      stats.value.totalHours = Number((stats.value.totalHours + created.flightHours).toFixed(2));
      stats.value.totalLandings += created.landings;

      // Update pilot profile hours in auth store
      if (authStore.pilot) {
        authStore.pilot.totalFlightHours = Number(
          (authStore.pilot.totalFlightHours + created.flightHours).toFixed(2),
        );
      }

      return true;
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to record flight log';
      error.value = Array.isArray(msg) ? msg.join(', ') : msg;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    entries,
    stats,
    isLoading,
    error,
    fetchLogbooks,
    createEntry,
  };
});
