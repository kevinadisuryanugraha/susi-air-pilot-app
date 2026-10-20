<template>
  <div class="schedule-calendar-wrap">
    <!-- Month Navigation Header Bar -->
    <div class="calendar-nav-bar">
      <button class="month-nav-btn" title="Previous Month" @click="store.prevMonth">
        <ChevronLeft :size="18" />
      </button>

      <div class="month-display">
        <div class="month-sub-tag">ROSTER CALENDAR</div>
        <h2 class="month-title">{{ store.monthName }} {{ store.currentYear }}</h2>
        <button
          v-if="store.currentMonth !== 5 || store.currentYear !== 2026"
          class="reset-today-btn mono"
          @click="store.fetchSchedules(2026, 5)"
        >
          RETURN TO MAY 2026
        </button>
      </div>

      <button class="month-nav-btn" title="Next Month" @click="store.nextMonth">
        <ChevronRight :size="18" />
      </button>
    </div>

    <!-- Duty Filter Chips Bar -->
    <div class="filter-chips-bar">
      <button
        class="filter-chip"
        :class="{ active: selectedFilter === 'ALL' }"
        @click="selectedFilter = 'ALL'"
      >
        ALL ({{ store.schedules.length }})
      </button>

      <button
        v-for="leg in store.legend"
        :key="leg.code"
        class="filter-chip"
        :class="{ active: selectedFilter === leg.code }"
        @click="selectedFilter = selectedFilter === leg.code ? 'ALL' : leg.code"
      >
        <span class="chip-dot" :style="{ backgroundColor: leg.color }"></span>
        <span>{{ leg.code }}</span>
      </button>
    </div>

    <!-- Calendar Grid Card -->
    <div class="calendar-card">
      <!-- Weekday headers -->
      <div class="weekdays-row">
        <span v-for="w in weekdays" :key="w" class="weekday-header mono">{{ w }}</span>
      </div>

      <!-- Loading state -->
      <div v-if="store.isLoading" class="calendar-loading">
        <div class="radar-spinner"></div>
        <span class="mono">FETCHING DUTY ROSTER...</span>
      </div>

      <!-- Days Grid -->
      <div v-else class="days-grid">
        <!-- Leading empty padding cells -->
        <div
          v-for="pad in firstDayOffset"
          :key="`pad-${pad}`"
          class="day-cell pad-cell"
        ></div>

        <!-- Real Month Days -->
        <div
          v-for="day in filteredDaysInMonth"
          :key="`day-${day.dateStr}`"
          class="day-cell"
          :class="{
            'has-duty': !!day.schedule,
            'is-today': day.dateStr === store.today,
            'is-dimmed': isDayDimmed(day),
          }"
          :style="day.schedule ? { backgroundColor: `${day.schedule.base_color}20`, borderColor: day.schedule.base_color } : {}"
          @click="openDayDetail(day)"
        >
          <!-- Day Header: Number + Indicator -->
          <div class="day-top">
            <span class="day-number mono tabular" :class="{ 'num-today': day.dateStr === store.today }">
              {{ day.dayNum }}
            </span>

            <!-- Status Indicator: Completed tick icon or remaining duty counter -->
            <div v-if="day.schedule" class="duty-status-badge">
              <span v-if="day.schedule.isCompleted" class="status-tick" title="All duties completed">
                <Check :size="9" stroke-width="3.5" />
              </span>
              <span v-else class="status-rem-badge mono font-bold" title="Remaining duties">
                {{ day.schedule.remainingDuties }}
              </span>
            </div>
          </div>

          <!-- Base Name / Airport Code -->
          <div class="day-bottom">
            <span
              v-if="day.schedule"
              class="base-code-tag mono"
              :style="{ backgroundColor: day.schedule.base_color }"
            >
              {{ day.schedule.base_name }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Duty Legend Drawer Accordion -->
    <div class="legend-card">
      <div class="legend-header">
        <Compass :size="14" class="legend-icon" />
        <h4 class="legend-title">Aviation Duty Codes</h4>
      </div>

      <div class="legend-pills-wrap">
        <div
          v-for="item in store.legend"
          :key="item.code"
          class="legend-pill-item"
        >
          <span class="swatch-circle" :style="{ backgroundColor: item.color }"></span>
          <span class="code-text mono">{{ item.code }}</span>
          <span class="label-desc">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Enhanced Flight Dispatch Sheet Modal -->
    <div v-if="selectedDay" class="modal-backdrop" @click="selectedDay = null">
      <div class="dispatch-sheet-modal" @click.stop>
        <div class="sheet-top-handle"></div>

        <div class="modal-header-strip">
          <div class="modal-badge-row">
            <span class="roster-badge mono">FLIGHT DISPATCH SHEET</span>
            <span v-if="selectedDay.dateStr === store.today" class="today-live-badge mono">TODAY</span>
          </div>
          <h3 class="modal-duty-title">{{ selectedDay.formattedDate }}</h3>
          <p class="modal-duty-subtitle mono">OPS CONTROL DESK · Susi Air Pangandaran</p>
        </div>

        <div class="modal-sheet-body">
          <div v-if="selectedDay.schedule" class="flight-leg-card" :style="{ borderLeftColor: selectedDay.schedule.base_color }">
            <div class="route-header">
              <div class="airport-pair mono">
                <span class="iata-code">{{ selectedDay.schedule.base_name }}</span>
                <ArrowRight :size="16" class="route-arrow" />
                <span class="iata-code">{{ getDestinationCode(selectedDay.schedule.base_name) }}</span>
              </div>

              <span class="duty-category-pill mono" :style="{ backgroundColor: selectedDay.schedule.base_color }">
                {{ selectedDay.schedule.duty_type }}
              </span>
            </div>

            <div class="aircraft-details-row">
              <span class="aircraft-type">Cessna 208B Grand Caravan EX</span>
              <span class="tail-number mono">PK-VVP</span>
            </div>

            <div class="metrics-grid-cockpit">
              <div class="cockpit-metric">
                <span class="m-title">PLANNED LEGS</span>
                <span class="m-num mono tabular font-bold">{{ selectedDay.schedule.count_schedules }} flights</span>
              </div>
              <div class="cockpit-metric">
                <span class="m-title">LOGGED LEGS</span>
                <span class="m-num mono tabular font-bold">{{ selectedDay.schedule.count_logbooks }} flights</span>
              </div>
              <div class="cockpit-metric">
                <span class="m-title">DUTY STATUS</span>
                <span
                  class="m-num mono font-bold"
                  :style="{ color: selectedDay.schedule.isCompleted ? '#10B981' : '#F59E0B' }"
                >
                  {{ selectedDay.schedule.isCompleted ? 'COMPLETED' : `${selectedDay.schedule.remainingDuties} REMAINING` }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="off-duty-box">
            <CalendarOff :size="28" class="off-icon" />
            <div class="off-text">
              <h4>Scheduled Rest / Off-Duty</h4>
              <p>Pilot is not assigned to flight operations or standby duty.</p>
            </div>
          </div>

          <div class="flight-legs-timeline-box">
            <div class="notice-head">
              <Info :size="16" />
              <span>Detail page coming soon</span>
            </div>
            <p class="notice-body">
              Digital loadsheet sign-off, NOTAM briefing pack, and live flight radar tracking will be activated in the v1.2 release.
            </p>
          </div>
        </div>

        <button class="sheet-action-btn" @click="selectedDay = null">
          Dismiss Roster Sheet
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSchedulesStore, type ScheduleItem } from '~/stores/schedules';
import { ChevronLeft, ChevronRight, Check, Compass, CalendarOff, Info, ArrowRight } from 'lucide-vue-next';

const store = useSchedulesStore();
const selectedDay = ref<any | null>(null);
const selectedFilter = ref<string>('ALL');

const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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

const filteredDaysInMonth = computed(() => {
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

function isDayDimmed(day: any): boolean {
  if (selectedFilter.value === 'ALL') return false;
  if (!day.schedule) return true;
  return day.schedule.duty_type !== selectedFilter.value;
}

function openDayDetail(day: any) {
  selectedDay.value = day;
}

function getDestinationCode(base: string): string {
  const destMap: Record<string, string> = {
    MKW: 'SOQ',
    PDG: 'BKS',
    CJN: 'HLP',
    HLP: 'CJN',
    SIQ: 'PDG',
  };
  return destMap[base] || 'SUB';
}
</script>

<style scoped lang="scss">
.schedule-calendar-wrap {
  padding: 18px 20px 24px;
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

  .month-sub-tag {
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #0284C7;
  }

  .month-title {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.4px;
  }

  .reset-today-btn {
    font-size: 8.5px;
    font-weight: 800;
    color: $color-brand-red;
    background: rgba(230, 55, 87, 0.1);
    border: 1px solid rgba(230, 55, 87, 0.25);
    padding: 2px 7px;
    border-radius: $radius-pill;
    margin-top: 3px;

    &:hover {
      background: rgba(230, 55, 87, 0.2);
    }
  }
}

.month-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-primary-navy;
  box-shadow: $shadow-sm;

  &:hover {
    background: #F1F5F9;
    color: $color-brand-red;
  }
}

// Filter chips bar
.filter-chips-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 12px;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 9px;
    border-radius: $radius-pill;
    background: white;
    border: 1px solid $color-border;
    font-size: 10px;
    font-weight: 700;
    color: #475569;
    white-space: nowrap;
    flex-shrink: 0;

    .chip-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    &.active {
      background: $color-primary-navy;
      color: white;
      border-color: $color-primary-navy;
    }
  }
}

// Calendar Card
.calendar-card {
  background: white;
  border-radius: $radius-card;
  padding: 14px 10px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  margin-bottom: 16px;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-size: 10px;
  font-weight: 800;
  color: #94A3B8;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.calendar-loading {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 10px;
  font-weight: 700;
  color: $color-text-secondary;

  .radar-spinner {
    width: 26px;
    height: 26px;
    border: 2px solid rgba(14, 33, 56, 0.1);
    border-top-color: #0284C7;
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
  border: 1px solid #F1F5F9;
  background: #F8FAFC;
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
    box-shadow: inset 0 0 0 2px $color-primary-navy;

    .day-number {
      font-weight: 800;
      color: $color-primary-navy;
    }
  }

  &.has-duty {
    border-width: 1.5px;
  }

  &.is-dimmed {
    opacity: 0.25;
  }

  &:hover {
    transform: translateY(-1.5px);
    box-shadow: $shadow-card;
  }
}

.day-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .day-number {
    font-size: 11px;
    font-weight: 700;
    color: #475569;
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
    background-color: $color-success;
    color: white;
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.4);
  }

  .status-rem-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background-color: $color-warning;
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
    letter-spacing: 0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
}

// Legend
.legend-card {
  background: white;
  border-radius: $radius-card;
  padding: 14px 16px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;

  .legend-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;

    .legend-icon {
      color: #0284C7;
    }

    .legend-title {
      font-size: 12px;
      font-weight: 800;
      color: $color-primary-navy;
      letter-spacing: 0.2px;
    }
  }
}

.legend-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-pill-item {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  padding: 3px 8px;
  border-radius: $radius-pill;
  font-size: 10px;

  .swatch-circle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .code-text {
    font-weight: 800;
    color: $color-primary-navy;
  }

  .label-desc {
    color: #64748B;
  }
}

// Enhanced Flight Dispatch Sheet Modal
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(7, 19, 33, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.dispatch-sheet-modal {
  width: 100%;
  max-width: 440px;
  background: white;
  border-top-left-radius: 26px;
  border-top-right-radius: 26px;
  padding: 12px 20px 24px;
  animation: slideUp 0.25s $ease-spring;
}

.sheet-top-handle {
  width: 36px;
  height: 4px;
  background: #CBD5E1;
  border-radius: 2px;
  margin: 0 auto 14px;
}

.modal-header-strip {
  margin-bottom: 14px;

  .modal-badge-row {
    display: flex;
    gap: 6px;
    margin-bottom: 4px;

    .roster-badge {
      font-size: 8.5px;
      font-weight: 800;
      color: #0284C7;
      background: rgba(2, 132, 199, 0.1);
      padding: 2px 7px;
      border-radius: $radius-pill;
    }

    .today-live-badge {
      font-size: 8.5px;
      font-weight: 800;
      color: $color-primary-navy;
      background: #E2E8F0;
      padding: 2px 7px;
      border-radius: $radius-pill;
    }
  }

  .modal-duty-title {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.3px;
  }

  .modal-duty-subtitle {
    font-size: 10px;
    color: #64748B;
    margin-top: 1px;
  }
}

.flight-leg-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-left-width: 4px;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 14px;

  .route-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .airport-pair {
      display: flex;
      align-items: center;
      gap: 8px;

      .iata-code {
        font-size: 18px;
        font-weight: 800;
        color: $color-primary-navy;
      }

      .route-arrow {
        color: $color-brand-red;
      }
    }

    .duty-category-pill {
      font-size: 10px;
      font-weight: 800;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
    }
  }

  .aircraft-details-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #64748B;
    padding-bottom: 10px;
    border-bottom: 1px dashed #CBD5E1;
    margin-bottom: 10px;

    .tail-number {
      font-weight: 800;
      color: $color-primary-navy;
    }
  }

  .metrics-grid-cockpit {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    text-align: center;

    .cockpit-metric {
      display: flex;
      flex-direction: column;

      .m-title {
        font-size: 8.5px;
        font-weight: 700;
        color: #94A3B8;
        letter-spacing: 0.3px;
      }

      .m-num {
        font-size: 12px;
        margin-top: 2px;
      }
    }
  }
}

.off-duty-box {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  margin-bottom: 14px;

  .off-icon {
    color: #94A3B8;
  }

  .off-text {
    h4 {
      font-size: 14px;
      font-weight: 800;
      color: $color-primary-navy;
    }

    p {
      font-size: 11px;
      color: #64748B;
      margin-top: 2px;
    }
  }
}

.flight-legs-timeline-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
  color: #1E40AF;
  margin-bottom: 16px;

  .notice-head {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: 800;
  }

  .notice-body {
    font-size: 10.5px;
    line-height: 1.4;
    color: #1E3A8A;
  }
}

.sheet-action-btn {
  width: 100%;
  padding: 13px;
  background: $color-primary-navy;
  color: white;
  font-weight: 800;
  border-radius: $radius-pill;
  font-size: 13px;
  letter-spacing: 0.3px;
  box-shadow: 0 4px 14px rgba(14, 33, 56, 0.25);

  &:hover {
    background: #152C4A;
  }
}
</style>
