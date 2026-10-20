<template>
  <div class="calendar-wrapper">
    <!-- Month Navigation -->
    <div class="month-nav">
      <button class="nav-arrow" title="Previous Month" @click="store.prevMonth">
        <ChevronLeft :size="18" />
      </button>

      <div class="month-info">
        <h2 class="month-heading">{{ store.monthName }} {{ store.currentYear }}</h2>
        <span class="duties-count">{{ store.schedules.length }} Duties Planned</span>
      </div>

      <button class="nav-arrow" title="Next Month" @click="store.nextMonth">
        <ChevronRight :size="18" />
      </button>
    </div>

    <!-- Calendar Grid Card -->
    <div class="calendar-card">
      <div class="weekdays-row">
        <span v-for="w in weekdays" :key="w" class="weekday-cell">{{ w }}</span>
      </div>

      <div v-if="store.isLoading" class="loading-calendar">
        <div class="spinner"></div>
        <span>Updating schedule...</span>
      </div>

      <div v-else class="days-grid">
        <!-- Padding cells -->
        <div
          v-for="pad in firstDayOffset"
          :key="`pad-${pad}`"
          class="day-cell pad-cell"
        ></div>

        <!-- Month days -->
        <div
          v-for="day in daysInMonth"
          :key="`day-${day.dateStr}`"
          class="day-cell"
          :class="{
            'has-duty': !!day.schedule,
            'is-today': day.dateStr === store.today,
          }"
          :style="day.schedule ? { backgroundColor: `${day.schedule.base_color}20`, borderColor: day.schedule.base_color } : {}"
          @click="openDayDetail(day)"
        >
          <div class="cell-top">
            <span class="day-num tabular" :class="{ 'num-today': day.dateStr === store.today }">
              {{ day.dayNum }}
            </span>

            <!-- Status Indicator: Checkmark when completed, otherwise remaining duties count -->
            <div v-if="day.schedule" class="status-indicator">
              <span v-if="day.schedule.isCompleted" class="icon-tick" title="Completed">
                <Check :size="9" stroke-width="3" />
              </span>
              <span v-else class="badge-remaining tabular font-bold" title="Remaining duties">
                {{ day.schedule.remainingDuties }}
              </span>
            </div>
          </div>

          <div class="cell-bottom">
            <span
              v-if="day.schedule"
              class="airport-code"
              :style="{ backgroundColor: day.schedule.base_color }"
            >
              {{ day.schedule.base_name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Duty Type Legend below calendar -->
    <div class="legend-card">
      <h3 class="legend-title">Duty Types</h3>
      <div class="legend-items-grid">
        <div
          v-for="item in store.legend"
          :key="item.code"
          class="legend-item"
        >
          <span class="color-dot" :style="{ backgroundColor: item.color }"></span>
          <span class="code font-bold">{{ item.code }}</span>
          <span class="label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Tapping a date shows placeholder page modal -->
    <div v-if="selectedDay" class="modal-overlay" @click="selectedDay = null">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <span class="date-pill font-semibold">{{ selectedDay.formattedDate }}</span>
          <h3 class="modal-title">Duty Details</h3>
        </div>

        <div class="modal-content">
          <div v-if="selectedDay.schedule" class="duty-summary" :style="{ borderLeftColor: selectedDay.schedule.base_color }">
            <div class="duty-row">
              <span class="duty-badge" :style="{ backgroundColor: selectedDay.schedule.base_color }">
                {{ selectedDay.schedule.base_name }}
              </span>
              <span class="duty-type-label font-semibold">{{ selectedDay.schedule.duty_type }}</span>
            </div>

            <div class="duty-stats">
              <div class="stat-item">
                <span class="stat-lbl">Scheduled</span>
                <span class="stat-num tabular font-bold">{{ selectedDay.schedule.count_schedules }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-lbl">Logged</span>
                <span class="stat-num tabular font-bold">{{ selectedDay.schedule.count_logbooks }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-lbl">Status</span>
                <span
                  class="stat-num font-bold"
                  :style="{ color: selectedDay.schedule.isCompleted ? '#1FBF8F' : '#F59E0B' }"
                >
                  {{ selectedDay.schedule.isCompleted ? 'Completed' : `${selectedDay.schedule.remainingDuties} left` }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="off-duty-notice">
            <span>No duty scheduled (Rest day)</span>
          </div>

          <!-- Brief Requirement Placeholder -->
          <div class="placeholder-box">
            <Info :size="16" />
            <span>Detail page coming soon</span>
          </div>
        </div>

        <button class="btn-close" @click="selectedDay = null">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSchedulesStore, type ScheduleItem } from '~/stores/schedules';
import { ChevronLeft, ChevronRight, Check, Info } from 'lucide-vue-next';

const store = useSchedulesStore();
const selectedDay = ref<any | null>(null);

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

onMounted(() => {
  if (store.schedules.length === 0) {
    store.fetchSchedules(2026, 5);
  }
});

const firstDayOffset = computed(() => {
  const d = new Date(Date.UTC(store.currentYear, store.currentMonth - 1, 1));
  const day = d.getUTCDay();
  return day === 0 ? 6 : day - 1;
});

const daysInMonth = computed(() => {
  const year = store.currentYear;
  const month = store.currentMonth;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const list = [];

  const schedMap = new Map<string, ScheduleItem>();
  for (const s of store.schedules) {
    schedMap.set(s.duty_date, s);
  }

  for (let i = 1; i <= count; i++) {
    const dayPad = String(i).padStart(2, '0');
    const monthPad = String(month).padStart(2, '0');
    const dateStr = `${year}-${monthPad}-${dayPad}`;
    const schedule = schedMap.get(dateStr) || null;

    list.push({
      dayNum: i,
      dateStr,
      formattedDate: `${i} ${store.monthName} ${year}`,
      schedule,
    });
  }

  return list;
});

function openDayDetail(day: any) {
  selectedDay.value = day;
}
</script>

<style scoped lang="scss">
.calendar-wrapper {
  padding: 16px 20px 24px;
}

.month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  .month-info {
    display: flex;
    flex-direction: column;
    align-items: center;

    .month-heading {
      font-size: 17px;
      font-weight: 800;
      color: $color-primary-navy;
    }

    .duties-count {
      font-size: 10px;
      color: $color-text-secondary;
      margin-top: 2px;
    }
  }

  .nav-arrow {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background-color: white;
    border: 1px solid $color-border;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-primary-navy;
    box-shadow: $shadow-sm;

    &:hover {
      background-color: #F1F5F9;
    }
  }
}

.calendar-card {
  background-color: white;
  border-radius: $radius-card;
  padding: 14px 10px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  margin-bottom: 16px;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: $color-text-muted;
  margin-bottom: 8px;
}

.loading-calendar {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: $color-text-secondary;

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #E2E8F0;
    border-top-color: $color-primary-navy;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day-cell {
  aspect-ratio: 1;
  border-radius: $radius-sm;
  border: 1px solid #F1F5F9;
  background-color: #F8FAFC;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  transition: $transition-default;

  &.pad-cell {
    visibility: hidden;
  }

  &.is-today {
    box-shadow: inset 0 0 0 1.5px $color-primary-navy;

    .day-num {
      font-weight: 800;
      color: $color-primary-navy;
    }
  }

  &.has-duty {
    border-width: 1.5px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-sm;
  }
}

.cell-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .day-num {
    font-size: 11px;
    font-weight: 600;
    color: #475569;
  }
}

.status-indicator {
  .icon-tick {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background-color: $color-success;
    color: white;
  }

  .badge-remaining {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background-color: $color-warning;
    color: white;
    font-size: 8px;
  }
}

.cell-bottom {
  display: flex;
  justify-content: center;

  .airport-code {
    font-size: 8px;
    font-weight: 700;
    color: white;
    padding: 1px 4px;
    border-radius: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Legend
.legend-card {
  background-color: white;
  border-radius: $radius-card;
  padding: 14px 16px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;

  .legend-title {
    font-size: 12px;
    font-weight: 700;
    color: $color-primary-navy;
    margin-bottom: 10px;
  }
}

.legend-items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #374151;

  .color-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .code {
    font-size: 10px;
    color: $color-primary-navy;
  }

  .label {
    color: $color-text-secondary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Modal
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(14, 33, 56, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background-color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  margin-bottom: 14px;

  .date-pill {
    font-size: 11px;
    color: $color-brand-red;
    background-color: #FEF2F2;
    padding: 2px 8px;
    border-radius: $radius-pill;
    display: inline-block;
    margin-bottom: 4px;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
  }
}

.duty-summary {
  background-color: #F8FAFC;
  border: 1px solid $color-border;
  border-left-width: 4px;
  border-radius: $radius-sm;
  padding: 12px;
  margin-bottom: 14px;

  .duty-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;

    .duty-badge {
      font-size: 11px;
      font-weight: 800;
      color: white;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .duty-type-label {
      font-size: 12px;
      color: $color-primary-navy;
    }
  }

  .duty-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    text-align: center;

    .stat-item {
      display: flex;
      flex-direction: column;

      .stat-lbl {
        font-size: 10px;
        color: $color-text-secondary;
      }

      .stat-num {
        font-size: 13px;
        margin-top: 2px;
      }
    }
  }
}

.off-duty-notice {
  padding: 16px;
  background-color: #F8FAFC;
  border: 1px dashed $color-border;
  border-radius: $radius-sm;
  color: $color-text-secondary;
  font-size: 12px;
  text-align: center;
  margin-bottom: 14px;
}

.placeholder-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: #EFF6FF;
  border: 1px solid #DBEAFE;
  color: #1D4ED8;
  font-size: 12px;
  font-weight: 600;
  border-radius: $radius-sm;
  margin-bottom: 16px;
}

.btn-close {
  width: 100%;
  padding: 11px;
  background-color: $color-primary-navy;
  color: white;
  font-weight: 700;
  border-radius: $radius-pill;
  font-size: 13px;

  &:hover {
    background-color: #152C4A;
  }
}
</style>
