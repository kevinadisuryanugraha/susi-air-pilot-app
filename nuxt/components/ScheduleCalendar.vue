<template>
  <div class="calendar-wrapper">
    <!-- Month Navigation -->
    <div class="month-nav anim-fade-up delay-2">
      <button class="nav-arrow" title="Previous Month" @click="store.prevMonth">
        <ChevronLeft :size="18" />
      </button>

      <div class="month-info">
        <h2 class="month-heading">{{ store.monthName }} <span class="year-text">{{ store.currentYear }}</span></h2>
        <span class="duties-count">
          <span class="duty-dot"></span>
          {{ store.schedules.length }} duties planned
        </span>
      </div>

      <button class="nav-arrow" title="Next Month" @click="store.nextMonth">
        <ChevronRight :size="18" />
      </button>
    </div>

    <!-- Calendar Grid Card -->
    <div class="calendar-card anim-fade-up delay-3">
      <!-- Weekday headers -->
      <div class="weekdays-row">
        <span v-for="w in weekdays" :key="w" class="weekday-cell">{{ w }}</span>
      </div>

      <!-- Loading state -->
      <div v-if="store.isLoading" class="loading-calendar">
        <div class="spinner"></div>
        <span>Updating schedule…</span>
      </div>

      <!-- Calendar grid -->
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
            'is-completed': day.schedule?.isCompleted,
          }"
          :style="day.schedule ? {
            backgroundColor: `${day.schedule.base_color}15`,
            borderColor: `${day.schedule.base_color}40`,
          } : {}"
          @click="openDayDetail(day)"
        >
          <!-- Top row: day number + status badge -->
          <div class="cell-top">
            <span
              class="day-num tabular"
              :class="{ 'num-today': day.dateStr === store.today }"
            >{{ day.dayNum }}</span>

            <div v-if="day.schedule" class="status-indicator">
              <span v-if="day.schedule.isCompleted" class="icon-tick">
                <Check :size="8" stroke-width="3.5" />
              </span>
              <span v-else class="badge-remaining tabular">
                {{ day.schedule.remainingDuties }}
              </span>
            </div>
          </div>

          <!-- Bottom: airport chip -->
          <div class="cell-bottom">
            <span
              v-if="day.schedule"
              class="airport-chip"
              :style="{ backgroundColor: day.schedule.base_color }"
            >{{ day.schedule.base_name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend-card anim-fade-up delay-4">
      <h3 class="legend-title">Duty Types</h3>
      <div class="legend-items-grid">
        <div
          v-for="item in store.legend"
          :key="item.code"
          class="legend-item"
        >
          <span class="color-swatch" :style="{ backgroundColor: item.color }">
            <span class="swatch-shine"></span>
          </span>
          <span class="code font-bold">{{ item.code }}</span>
          <span class="lbl">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal (Bottom Sheet) -->
    <Transition name="sheet">
      <div v-if="selectedDay" class="modal-overlay" @click="selectedDay = null">
        <div class="modal-sheet" @click.stop>
          <!-- Handle -->
          <div class="sheet-handle"></div>

          <!-- Header -->
          <div class="modal-header">
            <div class="date-pill font-semibold">{{ selectedDay.formattedDate }}</div>
            <h3 class="modal-title">Duty Details</h3>
          </div>

          <!-- Content -->
          <div v-if="selectedDay.schedule" class="duty-card" :style="{ borderLeftColor: selectedDay.schedule.base_color }">
            <!-- Airport + type -->
            <div class="duty-header-row">
              <span class="duty-airport-badge" :style="{ backgroundColor: selectedDay.schedule.base_color }">
                {{ selectedDay.schedule.base_name }}
              </span>
              <span class="duty-type-label font-semibold">{{ selectedDay.schedule.duty_type }}</span>
            </div>

            <!-- Stats grid -->
            <div class="duty-stats">
              <div class="stat-item">
                <span class="stat-lbl">Scheduled</span>
                <span class="stat-num tabular font-bold">{{ selectedDay.schedule.count_schedules }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-lbl">Logged</span>
                <span class="stat-num tabular font-bold">{{ selectedDay.schedule.count_logbooks }}</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <span class="stat-lbl">Status</span>
                <span
                  class="stat-num font-bold"
                  :style="{ color: selectedDay.schedule.isCompleted ? '#1FBF8F' : '#F59E0B' }"
                >
                  {{ selectedDay.schedule.isCompleted ? '✓ Done' : `${selectedDay.schedule.remainingDuties} left` }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="off-duty-card">
            <div class="off-duty-icon">🌙</div>
            <span class="off-duty-text">Rest Day — No duty scheduled</span>
          </div>

          <!-- Info note -->
          <div class="detail-note">
            <Info :size="13" />
            <span>Full flight detail page coming in next release</span>
          </div>

          <!-- Pre-Flight Weather METAR Briefing Card -->
          <div v-if="weatherData" class="weather-briefing-card">
            <div class="weather-head">
              <span class="icao-badge font-bold">{{ weatherData.icao }}</span>
              <span class="airport-name">{{ weatherData.name }}</span>
              <span class="condition-pill font-bold" :class="weatherData.condition.toLowerCase()">
                {{ weatherData.condition }}
              </span>
            </div>
            <div class="weather-grid">
              <div class="w-item">
                <span class="w-lbl">WIND</span>
                <span class="w-val tabular">{{ weatherData.wind }}</span>
              </div>
              <div class="w-item">
                <span class="w-lbl">VISIBILITY</span>
                <span class="w-val tabular">{{ weatherData.visibility }}</span>
              </div>
              <div class="w-item">
                <span class="w-lbl">TEMP</span>
                <span class="w-val tabular">{{ weatherData.temperature }}</span>
              </div>
              <div class="w-item">
                <span class="w-lbl">QNH</span>
                <span class="w-val tabular">{{ weatherData.altimeterQnh }}</span>
              </div>
            </div>
            <div class="metar-raw">
              <code>{{ weatherData.metarRaw }}</code>
            </div>
          </div>

          <!-- Quick Action to Logbook -->
          <div class="modal-actions-row">
            <NuxtLink to="/logbook" class="btn-quick-log" @click="selectedDay = null">
              Record Leg in Logbook
            </NuxtLink>
            <button class="btn-close" @click="selectedDay = null">
              Done
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useSchedulesStore, type ScheduleItem } from '~/stores/schedules';
import { ChevronLeft, ChevronRight, Check, Info } from 'lucide-vue-next';

const store = useSchedulesStore();
const selectedDay = ref<any | null>(null);
const weatherData = ref<any | null>(null);

// Mon-first week
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
  const { currentYear: year, currentMonth: month } = store;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const schedMap = new Map<string, ScheduleItem>(
    store.schedules.map(s => [s.duty_date, s])
  );

  return Array.from({ length: count }, (_, i) => {
    const dayNum  = i + 1;
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`;
    return {
      dayNum,
      dateStr,
      formattedDate: `${dayNum} ${store.monthName} ${year}`,
      schedule: schedMap.get(dateStr) ?? null,
    };
  });
});

async function openDayDetail(day: any) {
  selectedDay.value = day;
  weatherData.value = null;
  if (day.schedule?.base_name) {
    try {
      const config = useRuntimeConfig();
      const res = await $fetch(`${config.public.apiBase}/schedules/weather?airport=${day.schedule.base_name}`);
      weatherData.value = res;
    } catch {
      weatherData.value = null;
    }
  }
}
</script>

<style scoped lang="scss">
.calendar-wrapper {
  padding: 16px 16px 24px;

  @media (max-width: 375px) {
    padding: 12px 12px 20px;
  }
}

// ---- Month Nav ----
.month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.month-info {
  display: flex;
  flex-direction: column;
  align-items: center;

  .month-heading {
    font-size: 18px;
    font-weight: 800;
    color: $color-text-primary;
    letter-spacing: -0.4px;

    .year-text {
      color: $color-text-muted;
      font-weight: 600;
    }
  }

  .duties-count {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: $color-text-muted;
    font-weight: 500;
    margin-top: 2px;

    .duty-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: $color-chart-accent;
    }
  }
}

.nav-arrow {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: $color-card-surface;
  border: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $color-text-primary;
  box-shadow: $shadow-sm;
  transition: $transition-smooth;

  &:hover {
    background: $color-primary-navy;
    color: white;
    border-color: $color-primary-navy;
    box-shadow: $shadow-card;
  }
}

// ---- Calendar Card ----
.calendar-card {
  background: $color-card-surface;
  border-radius: $radius-card-lg;
  padding: 14px 8px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  margin-bottom: 14px;
  overflow: hidden; /* prevent any cell from bleeding out */

  @media (max-width: 360px) {
    padding: 10px 4px;
    border-radius: $radius-card;
  }
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 10px;

  .weekday-cell {
    font-size: 10px;
    font-weight: 700;
    color: $color-text-muted;
    padding-bottom: 6px;
    border-bottom: 1px solid $color-border;

    @media (max-width: 360px) {
      font-size: 8.5px;
    }
  }
}

.loading-calendar {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
  color: $color-text-muted;
  font-weight: 500;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  margin-top: 8px;

  @media (max-width: 360px) {
    gap: 2px;
  }
}

.day-cell {
  aspect-ratio: 1;
  border-radius: 10px;
  border: 1px solid transparent;
  background: $color-bg;
  padding: 4px 3px 3px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  position: relative;
  transition: $transition-smooth;

  &.pad-cell {
    visibility: hidden;
  }

  &.is-today {
    box-shadow: inset 0 0 0 2px $color-primary-navy;
    background: rgba(14, 33, 56, 0.04);

    .day-num {
      color: $color-primary-navy;
      font-weight: 800;
    }
  }

  &.has-duty {
    border-width: 1px;
  }

  &:hover:not(.pad-cell) {
    transform: scale(1.06);
    box-shadow: $shadow-card;
    z-index: 2;
  }

  &:active:not(.pad-cell) {
    transform: scale(0.97);
  }
}

.cell-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .day-num {
    font-size: 11px;
    font-weight: 600;
    color: $color-text-secondary;
    line-height: 1;
  }

  .num-today {
    font-weight: 800;
    color: $color-primary-navy;
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
    background: $color-success;
    color: white;
  }

  .badge-remaining {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: $color-warning;
    color: white;
    font-size: 7.5px;
    font-weight: 800;
  }
}

.cell-bottom {
  display: flex;
  justify-content: center;

  .airport-chip {
    font-size: 7.5px;
    font-weight: 800;
    color: white;
    padding: 1.5px 4px;
    border-radius: 4px;
    letter-spacing: 0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

// ---- Legend Card ----
.legend-card {
  background: $color-card-surface;
  border-radius: $radius-card;
  padding: 14px 16px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;

  .legend-title {
    font-size: 12.5px;
    font-weight: 800;
    color: $color-text-primary;
    margin-bottom: 12px;
    letter-spacing: -0.2px;
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
  gap: 7px;
  font-size: 11px;
  color: $color-text-secondary;
  overflow: hidden;

  .code {
    font-size: 10.5px;
    color: $color-text-primary;
    font-weight: 700;
    flex-shrink: 0;
  }

  .lbl {
    font-size: 10.5px;
    color: $color-text-muted;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.color-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;

  .swatch-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%);
  }
}

// ---- Modal Bottom Sheet ----
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 56, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.modal-sheet {
  width: 100%;
  max-width: 440px;
  background: white;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  padding: 10px 20px 32px;
  box-shadow: $shadow-floating;
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: $color-border-strong;
  border-radius: $radius-pill;
  margin: 0 auto 16px;
}

.modal-header {
  margin-bottom: 16px;

  .date-pill {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    color: $color-brand-red;
    background: rgba(230, 55, 87, 0.08);
    border: 1px solid rgba(230, 55, 87, 0.2);
    padding: 3px 10px;
    border-radius: $radius-pill;
    margin-bottom: 6px;
  }

  .modal-title {
    font-size: 20px;
    font-weight: 800;
    color: $color-text-primary;
    letter-spacing: -0.5px;
  }
}

.duty-card {
  background: $color-bg;
  border: 1px solid $color-border;
  border-left: 4px solid;
  border-radius: $radius-card;
  padding: 14px;
  margin-bottom: 14px;
}

.duty-header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  .duty-airport-badge {
    font-size: 11px;
    font-weight: 800;
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 0.5px;
  }

  .duty-type-label {
    font-size: 13px;
    color: $color-text-primary;
    font-weight: 600;
  }
}

.duty-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: $color-card-surface;
  border-radius: $radius-sm;
  overflow: hidden;
  border: 1px solid $color-border;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;

  .stat-lbl {
    font-size: 10px;
    color: $color-text-muted;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .stat-num {
    font-size: 15px;
    color: $color-text-primary;
  }
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: $color-border;
  flex-shrink: 0;
}

.off-duty-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-card;
  padding: 16px;
  margin-bottom: 14px;

  .off-duty-icon {
    font-size: 24px;
    line-height: 1;
  }

  .off-duty-text {
    font-size: 13px;
    font-weight: 600;
    color: $color-text-muted;
  }
}

.detail-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(34, 197, 232, 0.08);
  border: 1px solid rgba(34, 197, 232, 0.2);
  border-radius: $radius-sm;
  color: #0E7696;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.weather-briefing-card {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: $radius-sm;
  padding: 12px;
  margin-bottom: 14px;

  .weather-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .icao-badge {
      font-size: 11px;
      background-color: $color-primary-navy;
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .airport-name {
      font-size: 11.5px;
      font-weight: 700;
      color: $color-primary-navy;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .condition-pill {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: $radius-pill;

      &.vfr {
        background-color: #DCFCE7;
        color: #15803D;
      }
    }
  }

  .weather-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    text-align: center;
    margin-bottom: 8px;

    .w-item {
      display: flex;
      flex-direction: column;

      .w-lbl {
        font-size: 8px;
        font-weight: 700;
        color: $color-text-secondary;
      }

      .w-val {
        font-size: 10px;
        font-weight: 700;
        color: $color-primary-navy;
        margin-top: 1px;
      }
    }
  }

  .metar-raw {
    font-size: 9.5px;
    color: #475569;
    background-color: #F1F5F9;
    padding: 4px 6px;
    border-radius: 4px;
    overflow-x: auto;
    white-space: nowrap;
  }
}

.modal-actions-row {
  display: flex;
  gap: 10px;

  .btn-quick-log {
    flex: 1;
    padding: 12px;
    background-color: $color-brand-red;
    color: white;
    font-weight: 700;
    font-size: 13px;
    border-radius: $radius-pill;
    text-align: center;
    text-decoration: none;

    &:hover {
      background-color: #D42646;
    }
  }

  .btn-close {
    flex: 1;
    padding: 12px;
    background: $color-primary-navy;
    color: white;
    font-weight: 700;
    border-radius: $radius-pill;
    font-size: 13px;

    &:hover {
      background: #152C4A;
    }
  }
}

// Bottom sheet transition
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;

  .modal-sheet {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;

  .modal-sheet {
    transform: translateY(100%);
  }
}
</style>
