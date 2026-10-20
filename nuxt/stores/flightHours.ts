import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

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

export interface FlightHoursSummary {
  today: string;
  selectedRange: '1w' | '1m' | '3m' | '6m' | '1y';
  cards: LimitCard[];
  chart: {
    range: '1w' | '1m' | '3m' | '6m' | '1y';
    limitLine: number;
    yAxisMax: number;
    windowDays: number;
    displayRangeDays: number;
    series: ChartSeriesPoint[];
  };
}

export const useFlightHoursStore = defineStore('flightHours', () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const authStore = useAuthStore();

  const summary = ref<FlightHoursSummary | null>(null);
  const selectedRange = ref<'1w' | '1m' | '3m' | '6m' | '1y'>('1w');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSummary(range?: '1w' | '1m' | '3m' | '6m' | '1y') {
    if (range) {
      selectedRange.value = range;
    }
    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<FlightHoursSummary>(
        `${apiBase}/flight-hours/summary?range=${selectedRange.value}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      );
      summary.value = data;
    } catch (err: any) {
      if (err?.status === 401) {
        authStore.logout();
      } else {
        error.value = err?.data?.message || err?.message || 'Failed to load flight hours summary';
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    summary,
    selectedRange,
    isLoading,
    error,
    fetchSummary,
  };
});
