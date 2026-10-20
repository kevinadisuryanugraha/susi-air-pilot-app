import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export interface ScheduleItem {
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

export interface LegendItem {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesResponse {
  year: string;
  month: string;
  today: string;
  schedules: ScheduleItem[];
  legend: LegendItem[];
}

export const useSchedulesStore = defineStore('schedules', () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const authStore = useAuthStore();

  const schedules = ref<ScheduleItem[]>([]);
  const legend = ref<LegendItem[]>([]);
  const currentYear = ref(2026);
  const currentMonth = ref(5); // May
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Month navigation string: YYYY, MM (padded)
  const formattedMonth = computed(() => String(currentMonth.value).padStart(2, '0'));
  const monthName = computed(() => {
    const d = new Date(Date.UTC(currentYear.value, currentMonth.value - 1, 1));
    return d.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  });

  async function fetchSchedules(year?: number, month?: number) {
    if (year !== undefined) currentYear.value = year;
    if (month !== undefined) currentMonth.value = month;

    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<SchedulesResponse>(
        `${apiBase}/schedules?year=${currentYear.value}&month=${formattedMonth.value}`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        },
      );
      schedules.value = data.schedules;
      legend.value = data.legend;
    } catch (err: any) {
      if (err?.status === 401) {
        authStore.logout();
      } else {
        error.value = err?.data?.message || err?.message || 'Failed to load schedules';
      }
    } finally {
      isLoading.value = false;
    }
  }

  function nextMonth() {
    if (currentMonth.value === 12) {
      currentMonth.value = 1;
      currentYear.value += 1;
    } else {
      currentMonth.value += 1;
    }
    fetchSchedules();
  }

  function prevMonth() {
    if (currentMonth.value === 1) {
      currentMonth.value = 12;
      currentYear.value -= 1;
    } else {
      currentMonth.value -= 1;
    }
    fetchSchedules();
  }

  return {
    schedules,
    legend,
    currentYear,
    currentMonth,
    formattedMonth,
    monthName,
    isLoading,
    error,
    fetchSchedules,
    nextMonth,
    prevMonth,
  };
});
