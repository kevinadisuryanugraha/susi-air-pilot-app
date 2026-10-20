<template>
  <div class="schedule-calendar-wrap">
    <!-- Month Navigation Bar -->
    <div class="calendar-nav-bar">
      <button class="month-nav-btn" title="Previous Month" @click="store.prevMonth">
        <ChevronLeft :size="20" />
      </button>

      <div class="month-display">
        <h2 class="month-title">{{ store.monthName }} {{ store.currentYear }}</h2>
        <span class="schedule-count-pill">{{ store.schedules.length }} Assigned Duties</span>
      </div>

      <button class="month-nav-btn" title="Next Month" @click="store.nextMonth">
        <ChevronRight :size="20" />
      </button>
    </div>

    <!-- Calendar Grid Card -->
    <div class="calendar-card">
      <!-- Weekday headers -->
      <div class="weekdays-row">
        <span v-for="w in weekdays" :key="w" class="weekday-header">{{ w }}</span>
      </div>

      <!-- Loading overlay -->
      <div v-if="store.isLoading" class="calendar-loading">
        <div class="spinner"></div>
        <span>Updating schedule...</span>
      </div>

      <!-- Day Cells -->
      <div v-else class="days-grid">
        <!-- Leading empty padding cells -->
        <div
          v-for="pad in firstDayOffset"
          :key="`pad-${pad}`"
          class="day-cell pad-cell"
        ></div>

        <!-- Real Month Days -->
        <div
          v-for="day in daysInMonth"
          :key="`day-${day.dateStr}`"
          class="day-cell"
          :class="{
            'has-duty': !!day.schedule,
            'is-today': day.dateStr === store.today,
          }"
          :style="day.schedule ? { backgroundColor: `${day.schedule.base_color}25`, borderColor: day.schedule.base_color } : {}"
          @click="openDayDetail(day)"
        >
          <!-- Day Number -->
          <div class="day-top">
            <span class="day-number tabular" :class="{ 'num-today': day.dateStr === store.today }">
              {{ day.dayNum }}
            </span>

            <!-- Duty Status Indicator: Tick or remaining duties badge -->
            <div v-if="day.schedule" class="duty-status-badge">
              <span v-if="day.schedule.isCompleted" class="status-tick" title="All duties completed">
                <Check :size="10" stroke-width="3" />
              </span>
              <span v-else class="status-rem-badge" title="Duties remaining">
                {{ day.schedule.remainingDuties }}
              </span>
            </div>
          </div>

          <!-- Base Name / Airport Code -->
          <div class="day-bottom">
            <span
              v-if="day.schedule"
              class="base-code-tag"
              :style="{ backgroundColor: day.schedule.base_color }"
            >
              {{ day.schedule.base_name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend Section -->
    <div class="legend-section">
      <h4 class="legend-title">Duty Type Legend</h4>
      <div class="legend-grid">
        <div
          v-for="item in store.legend"
          :key="item.code"
          class="legend-item"
        >
          <span class="color-dot" :style="{ backgroundColor: item.color }"></span>
          <span class="code-badge">{{ item.code }}</span>
          <span class="label-text">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Modal / Placeholder: Detail page coming soon -->
    <div v-if="selectedDay" class="modal-backdrop" @click="selectedDay = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-badge-row">
            <span class="modal-flight-badge">FLIGHT ROSTER</span>
            <span v-if="selectedDay.dateStr === store.today" class="today-tag">TODAY</span>
          </div>
          <h3 class="modal-title">{{ selectedDay.formattedDate }}</h3>
          <p class="modal-subtitle">Operational Duty Overview</p>
        </div>

        <div class="modal-body">
          <div v-if="selectedDay.schedule" class="duty-info-card" :style="{ borderLeftColor: selectedDay.schedule.base_color }">
            <div class="duty-info-top">
              <span class="base-large-pill" :style="{ backgroundColor: selectedDay.schedule.base_color }">
                Base: {{ selectedDay.schedule.base_name }}
              </span>
              <span class="duty-type-pill">{{ selectedDay.schedule.duty_type }}</span>
            </div>

            <div class="duty-metrics">
              <div class="metric">
                <span class="m-label">Scheduled</span>
                <span class="m-val tabular">{{ selectedDay.schedule.count_schedules }} flights</span>
              </div>
              <div class="metric">
                <span class="m-label">Logged</span>
                <span class="m-val tabular">{{ selectedDay.schedule.count_logbooks }} flights</span>
              </div>
              <div class="metric">
                <span class="m-label">Status</span>
                <span class="m-val" :style="{ color: selectedDay.schedule.isCompleted ? '#10B981' : '#F59E0B' }">
                  {{ selectedDay.schedule.isCompleted ? 'Completed' : `${selectedDay.schedule.remainingDuties} Remaining` }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="no-duty-card">
            <CalendarOff :size="24" class="off-icon" />
            <span>Off-Duty / Standby Rest Day</span>
          </div>

          <div class="placeholder-notice">
            <Info :size="18" />
            <p><strong>Detail page coming soon</strong><br />Full route dispatch and flight leg details will be available in the next release.</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="close-modal-btn" @click="selectedDay = null">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSchedulesStore, type ScheduleItem } from '~/stores/schedules';
import { ChevronLeft, ChevronRight, Check, CalendarOff, Info } from 'lucide-vue-next';

const store = useSchedulesStore();
const selectedDay = ref<any | null>(null);

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

onMounted(() => {
  if (store.schedules.length === 0) {
    store.fetchSchedules(2026, 5);
  }
});

// Calculate calendar offset and day structure
const firstDayOffset = computed(() => {
  // ISO Day of week for Day 1 of the selected month (Mon=0, Tue=1, ..., Sun=6)
  const d = new Date(Date.UTC(store.currentYear, store.currentMonth - 1, 1));
  const day = d.getUTCDay(); // 0 is Sun, 1 is Mon...
  return day === 0 ? 6 : day - 1;
});

const daysInMonth = computed(() => {
  const year = store.currentYear;
  const month = store.currentMonth;
  // Get days count
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
.schedule-calendar-wrap {
  padding: 16px 20px 24px;
}

.calendar-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.month-display {
  display: flex;
  flex-direction: column;
  align-items: center;

  .month-title {
    font-size: 17px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.3px;
  }

  .schedule-count-pill {
    font-size: 10px;
    font-weight: 600;
    color: $color-text-secondary;
    background: #E5E7EB;
    padding: 1px 8px;
    border-radius: $radius-pill;
    margin-top: 2px;
  }
}

.month-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: $color-card-surface;
  border: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-primary-navy;
  box-shadow: $shadow-card;

  &:hover {
    background: #F3F4F6;
    color: $color-brand-red;
  }
}

.calendar-card {
  background: $color-card-surface;
  border-radius: $radius-card;
  padding: 14px 10px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  margin-bottom: 18px;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: $color-text-secondary;
  margin-bottom: 8px;
}

.calendar-loading {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $color-text-secondary;
  font-size: 12px;

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #E5E7EB;
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
  border-radius: 8px;
  border: 1px solid #F0F2F5;
  background: #FAFAFB;
  padding: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;

  &.pad-cell {
    visibility: hidden;
  }

  &.is-today {
    box-shadow: inset 0 0 0 1.5px $color-primary-navy;

    .day-number {
      font-weight: 800;
      color: $color-primary-navy;
    }
  }

  &.has-duty {
    border-width: 1.5px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(14, 33, 56, 0.1);
  }
}

.day-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .day-number {
    font-size: 11px;
    font-weight: 600;
    color: #4B5563;
  }
}

.duty-status-badge {
  .status-tick {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background-color: #10B981;
    color: white;
  }

  .status-rem-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background-color: #F59E0B;
    color: white;
    font-size: 8px;
    font-weight: 800;
  }
}

.day-bottom {
  display: flex;
  justify-content: center;

  .base-code-tag {
    font-size: 8px;
    font-weight: 800;
    color: white;
    padding: 1px 4px;
    border-radius: 3px;
    letter-spacing: 0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Legend
.legend-section {
  background: $color-card-surface;
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

.legend-grid {
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
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .code-badge {
    font-size: 9px;
    font-weight: 700;
    background: #F3F4F6;
    padding: 1px 4px;
    border-radius: 3px;
    color: $color-primary-navy;
  }

  .label-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// Modal
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 56, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  width: 100%;
  max-width: 440px;
  background: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px 20px 24px;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  margin-bottom: 16px;

  .modal-badge-row {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;

    .modal-flight-badge {
      font-size: 9px;
      font-weight: 800;
      color: $color-brand-red;
      background: rgba(230, 55, 87, 0.12);
      padding: 2px 7px;
      border-radius: $radius-pill;
    }

    .today-tag {
      font-size: 9px;
      font-weight: 800;
      color: $color-primary-navy;
      background: #E5E7EB;
      padding: 2px 7px;
      border-radius: $radius-pill;
    }
  }

  .modal-title {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
  }

  .modal-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
  }
}

.duty-info-card {
  background: #F8FAFC;
  border: 1px solid $color-border;
  border-left-width: 4px;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 14px;

  .duty-info-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .base-large-pill {
      font-size: 11px;
      font-weight: 800;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .duty-type-pill {
      font-size: 11px;
      font-weight: 700;
      color: $color-primary-navy;
      background: #E2E8F0;
      padding: 3px 8px;
      border-radius: 4px;
    }
  }

  .duty-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    text-align: center;

    .metric {
      display: flex;
      flex-direction: column;

      .m-label {
        font-size: 9px;
        color: $color-text-secondary;
      }

      .m-val {
        font-size: 12px;
        font-weight: 700;
        margin-top: 2px;
      }
    }
  }
}

.no-duty-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background: #F9FAFB;
  border: 1px dashed #D1D5DB;
  border-radius: 8px;
  color: $color-text-secondary;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 14px;
}

.placeholder-notice {
  display: flex;
  gap: 10px;
  padding: 12px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
  color: #1E40AF;
  font-size: 11px;
  line-height: 1.4;
  margin-bottom: 16px;
}

.close-modal-btn {
  width: 100%;
  padding: 12px;
  background: $color-primary-navy;
  color: white;
  font-weight: 700;
  border-radius: $radius-pill;
  font-size: 14px;

  &:hover {
    background: #152C4A;
  }
}
</style>
