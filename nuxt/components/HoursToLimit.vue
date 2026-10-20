<template>
  <section class="hours-to-limit">
    <div class="section-header">
      <div class="title-group">
        <h3 class="section-title">Hours to Limit</h3>
        <p class="section-subtitle">CASR Regulatory Flight Duty Limits</p>
      </div>
      <span class="baseline-badge" title="Simulation Baseline">
        Ref: {{ store.summary?.today || '2026-05-15' }}
      </span>
    </div>

    <!-- 4 Regulatory Limit Summary Cards -->
    <div class="cards-grid">
      <div
        v-for="card in store.summary?.cards || []"
        :key="card.type"
        class="limit-card"
        :class="[`status-${card.status}`]"
      >
        <div class="card-top">
          <span class="card-label">{{ card.label }}</span>
          <span class="window-badge">{{ card.windowDescription }}</span>
        </div>

        <div class="card-values">
          <div class="main-val">
            <span class="current-hrs tabular">{{ card.currentHours }}</span>
            <span class="divider">/</span>
            <span class="limit-hrs tabular">{{ card.limit }}</span>
            <span class="unit">h</span>
          </div>

          <span
            class="status-pill"
            :class="[`pill-${card.status}`]"
          >
            {{ card.status === 'danger' ? 'Exceeded' : card.status === 'warning' ? 'Near Limit' : 'Safe' }}
          </span>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar-bg">
          <div
            class="progress-fill"
            :class="[`fill-${card.status}`]"
            :style="{ width: `${Math.min(100, card.percentage)}%` }"
          ></div>
        </div>

        <div class="card-footer">
          <span class="remaining-text">
            <template v-if="card.isExceeded">
              Over limit by {{ (card.currentHours - card.limit).toFixed(1) }}h
            </template>
            <template v-else>
              {{ card.remainingHours }}h remaining
            </template>
          </span>
          <span class="percentage tabular">{{ card.percentage }}%</span>
        </div>
      </div>
    </div>

    <!-- Flight Hours Trend Chart -->
    <div class="chart-container">
      <div class="chart-header">
        <div class="chart-title-wrap">
          <h4 class="chart-title">Flight Hours Trend</h4>
          <span class="chart-subtitle">15-day window (Today centered)</span>
        </div>

        <!-- Range toggle buttons: 1w, 1m, 3m, 6m, 1y -->
        <div class="range-toggles">
          <button
            v-for="r in rangeOptions"
            :key="r"
            class="toggle-btn"
            :class="{ active: store.selectedRange === r }"
            @click="handleRangeChange(r)"
          >
            {{ r }}
          </button>
        </div>
      </div>

      <!-- Legend & Limit Indicator -->
      <div class="chart-legend-bar">
        <div class="legend-item">
          <span class="swatch line-accent"></span>
          <span>Rolling Sum ({{ store.summary?.chart?.windowDays }}d window)</span>
        </div>
        <div class="legend-item">
          <span class="swatch line-limit"></span>
          <span>Limit: <strong class="tabular">{{ store.summary?.chart?.limitLine }}h</strong></span>
        </div>
      </div>

      <!-- SVG Reactive Responsive Chart -->
      <div class="chart-wrapper">
        <div v-if="store.isLoading" class="chart-loading">
          <div class="spinner"></div>
          <span>Calculating rolling window on server...</span>
        </div>

        <svg
          v-else-if="chartPoints.length > 0"
          class="trend-svg"
          viewBox="0 0 380 210"
          preserveAspectRatio="xMidYMid meet"
        >
          <!-- Grid lines -->
          <line
            v-for="tick in yTicks"
            :key="`ytick-${tick.val}`"
            :x1="padding.left"
            :y1="tick.y"
            :x2="svgWidth - padding.right"
            :y2="tick.y"
            class="grid-line"
          />

          <!-- Y-axis labels -->
          <text
            v-for="tick in yTicks"
            :key="`ylabel-${tick.val}`"
            :x="padding.left - 6"
            :y="tick.y + 4"
            class="y-axis-label tabular"
          >
            {{ tick.val }}
          </text>

          <!-- Today vertical indicator background line -->
          <line
            v-if="todayPoint"
            :x1="todayPoint.x"
            :y1="padding.top - 5"
            :x2="todayPoint.x"
            :y2="svgHeight - padding.bottom"
            class="today-line"
          />

          <!-- Today indicator header badge -->
          <g v-if="todayPoint">
            <rect
              :x="todayPoint.x - 22"
              :y="padding.top - 20"
              width="44"
              height="16"
              rx="8"
              class="today-badge-bg"
            />
            <text
              :x="todayPoint.x"
              :y="padding.top - 8"
              class="today-badge-text"
            >
              TODAY
            </text>
          </g>

          <!-- Red Limit Line (Horizontal) -->
          <line
            :x1="padding.left"
            :y1="limitY"
            :x2="svgWidth - padding.right"
            :y2="limitY"
            class="limit-line-red"
          />
          <text
            :x="svgWidth - padding.right"
            :y="limitY - 4"
            class="limit-label-red tabular"
          >
            LIMIT {{ store.summary?.chart?.limitLine }}h
          </text>

          <!-- Area fill under line -->
          <polygon :points="areaPoints" class="chart-area" />

          <!-- Main trend path -->
          <polyline :points="polyPoints" class="chart-polyline" />

          <!-- Data Points -->
          <g
            v-for="(pt, idx) in chartPoints"
            :key="`pt-${pt.date}`"
            class="data-point-group"
            @click="activePoint = pt"
            @mouseenter="activePoint = pt"
          >
            <!-- Invisible larger tap target -->
            <circle :cx="pt.x" :cy="pt.y" r="12" class="tap-target" />

            <!-- Point outer pulse for today or exceeded -->
            <circle
              v-if="pt.isToday || pt.isExceeded"
              :cx="pt.x"
              :cy="pt.y"
              :r="pt.isToday ? 7 : 6"
              :class="pt.isExceeded ? 'point-pulse-exceeded' : 'point-pulse-today'"
            />

            <!-- Point dot -->
            <circle
              :cx="pt.x"
              :cy="pt.y"
              :r="pt.isToday ? 5 : 3.5"
              :class="[
                'point-dot',
                pt.isToday ? 'dot-today' : '',
                pt.isExceeded ? 'dot-exceeded' : 'dot-normal'
              ]"
            />

            <!-- X-axis date labels -->
            <text
              :x="pt.x"
              :y="svgHeight - padding.bottom + 16"
              class="x-axis-label tabular"
              :class="{ 'label-today': pt.isToday }"
            >
              {{ pt.dayNumber }}
            </text>
          </g>

          <!-- Active point tooltip box -->
          <g v-if="activePoint" class="tooltip-group">
            <rect
              :x="Math.max(10, Math.min(svgWidth - 110, activePoint.x - 55))"
              :y="Math.max(10, activePoint.y - 42)"
              width="110"
              height="34"
              rx="6"
              class="tooltip-box"
            />
            <text
              :x="Math.max(10, Math.min(svgWidth - 110, activePoint.x - 55)) + 55"
              :y="Math.max(10, activePoint.y - 42) + 14"
              class="tooltip-date"
            >
              {{ activePoint.date }} {{ activePoint.isToday ? '(Today)' : '' }}
            </text>
            <text
              :x="Math.max(10, Math.min(svgWidth - 110, activePoint.x - 55)) + 55"
              :y="Math.max(10, activePoint.y - 42) + 27"
              class="tooltip-val"
            >
              Sum: {{ activePoint.rollingSum }}h (Day: {{ activePoint.dailyHours }}h)
            </text>
          </g>
        </svg>

        <div v-if="activePoint" class="point-detail-chip">
          <span class="chip-date">{{ activePoint.formattedDate }}</span>
          <span class="chip-sum">
            Rolling Sum: <strong>{{ activePoint.rollingSum }}h</strong>
          </span>
          <span class="chip-daily">
            Daily: <strong>{{ activePoint.dailyHours }}h</strong>
          </span>
          <span v-if="activePoint.isExceeded" class="chip-badge-exceeded">
            ⚠️ Limit Exceeded
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFlightHoursStore, type ChartSeriesPoint } from '~/stores/flightHours';

const store = useFlightHoursStore();
const rangeOptions = ['1w', '1m', '3m', '6m', '1y'] as const;
const activePoint = ref<any | null>(null);

const svgWidth = 380;
const svgHeight = 210;
const padding = { top: 32, right: 24, bottom: 34, left: 36 };

const plotWidth = svgWidth - padding.left - padding.right;
const plotHeight = svgHeight - padding.top - padding.bottom;

onMounted(() => {
  if (!store.summary) {
    store.fetchSummary('1w');
  }
});

function handleRangeChange(r: '1w' | '1m' | '3m' | '6m' | '1y') {
  activePoint.value = null;
  store.fetchSummary(r);
}

const yMax = computed(() => store.summary?.chart?.yAxisMax || 45);
const limitLine = computed(() => store.summary?.chart?.limitLine || 40);

const limitY = computed(() => {
  return padding.top + (1 - limitLine.value / yMax.value) * plotHeight;
});

const yTicks = computed(() => {
  const max = yMax.value;
  const steps = 4;
  const stepVal = Math.round(max / steps);
  const ticks = [];
  for (let i = 0; i <= steps; i++) {
    const val = i * stepVal;
    if (val <= max) {
      const y = padding.top + (1 - val / max) * plotHeight;
      ticks.push({ val, y });
    }
  }
  return ticks;
});

const chartPoints = computed(() => {
  const series = store.summary?.chart?.series || [];
  if (series.length === 0) return [];

  const count = series.length;
  const stepX = count > 1 ? plotWidth / (count - 1) : 0;

  return series.map((pt: ChartSeriesPoint, idx: number) => {
    const x = padding.left + idx * stepX;
    // Cap minimum Y visual at 0 to avoid drawing outside the SVG
    const ratio = Math.max(0, pt.rollingSum / yMax.value);
    const y = padding.top + (1 - ratio) * plotHeight;
    const dayNumber = pt.date.slice(8); // 'DD'

    return {
      ...pt,
      x,
      y,
      dayNumber,
    };
  });
});

const todayPoint = computed(() => {
  return chartPoints.value.find((p) => p.isToday);
});

const polyPoints = computed(() => {
  return chartPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
});

const areaPoints = computed(() => {
  if (chartPoints.value.length === 0) return '';
  const first = chartPoints.value[0];
  const last = chartPoints.value[chartPoints.value.length - 1];
  const baseline = svgHeight - padding.bottom;
  const pts = chartPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
  return `${first.x},${baseline} ${pts} ${last.x},${baseline}`;
});
</script>

<style scoped lang="scss">
.hours-to-limit {
  padding: 16px 20px 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.title-group {
  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: $color-primary-navy;
    letter-spacing: -0.2px;
  }

  .section-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 1px;
  }
}

.baseline-badge {
  font-size: 10px;
  font-weight: 600;
  background: #E5E7EB;
  color: #374151;
  padding: 3px 8px;
  border-radius: $radius-pill;
}

// 4 Cards Grid
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.limit-card {
  background-color: $color-card-surface;
  border-radius: $radius-card;
  padding: 12px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &.status-danger {
    border-color: rgba(230, 55, 87, 0.4);
    background: linear-gradient(180deg, #FFFFFF 0%, #FFF5F7 100%);
  }

  &.status-warning {
    border-color: rgba(245, 158, 11, 0.4);
  }
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  .card-label {
    font-size: 12px;
    font-weight: 700;
    color: $color-primary-navy;
  }

  .window-badge {
    font-size: 9px;
    font-weight: 500;
    color: $color-text-secondary;
    background: #F3F4F6;
    padding: 1px 6px;
    border-radius: 4px;
  }
}

.card-values {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;

  .main-val {
    display: flex;
    align-items: baseline;
    gap: 2px;

    .current-hrs {
      font-size: 17px;
      font-weight: 800;
      color: $color-primary-navy;
    }

    .divider {
      color: $color-text-muted;
      font-size: 12px;
    }

    .limit-hrs {
      font-size: 12px;
      font-weight: 600;
      color: $color-text-secondary;
    }

    .unit {
      font-size: 10px;
      color: $color-text-muted;
      margin-left: 1px;
    }
  }

  .status-pill {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: $radius-pill;

    &.pill-safe {
      background-color: rgba(31, 191, 143, 0.15);
      color: #0E805D;
    }

    &.pill-warning {
      background-color: rgba(245, 158, 11, 0.15);
      color: #B45309;
    }

    &.pill-danger {
      background-color: rgba(230, 55, 87, 0.15);
      color: #C11E3E;
    }
  }
}

.progress-bar-bg {
  height: 5px;
  background-color: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 6px;

  .progress-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.4s ease;

    &.fill-safe { background-color: $color-success; }
    &.fill-warning { background-color: $color-warning; }
    &.fill-danger { background-color: $color-danger; }
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  color: $color-text-secondary;

  .remaining-text {
    font-weight: 500;
  }

  .percentage {
    font-weight: 700;
  }
}

// Chart container
.chart-container {
  background-color: $color-card-surface;
  border-radius: $radius-card;
  padding: 16px 14px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-title-wrap {
  .chart-title {
    font-size: 14px;
    font-weight: 700;
    color: $color-primary-navy;
  }

  .chart-subtitle {
    font-size: 10px;
    color: $color-text-secondary;
  }
}

.range-toggles {
  display: flex;
  background: #F0F2F5;
  border-radius: 8px;
  padding: 2px;
  gap: 2px;

  .toggle-btn {
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 600;
    color: $color-text-secondary;
    border-radius: 6px;
    background: transparent;

    &.active {
      background: $color-primary-navy;
      color: white;
    }
  }
}

.chart-legend-bar {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  font-size: 10px;
  color: $color-text-secondary;
  margin-bottom: 8px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;

    .swatch {
      width: 10px;
      height: 3px;
      border-radius: 2px;

      &.line-accent { background-color: $color-chart-accent; }
      &.line-limit { background-color: $color-brand-red; }
    }
  }
}

.chart-wrapper {
  position: relative;
  width: 100%;
}

.chart-loading {
  height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

.trend-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.grid-line {
  stroke: #E5E7EB;
  stroke-width: 1;
  stroke-dasharray: 2, 3;
}

.y-axis-label {
  font-size: 9px;
  fill: #9CA3AF;
  text-anchor: end;
  font-weight: 500;
}

.today-line {
  stroke: rgba(14, 33, 56, 0.35);
  stroke-width: 1.5;
  stroke-dasharray: 3, 3;
}

.today-badge-bg {
  fill: $color-primary-navy;
}

.today-badge-text {
  fill: white;
  font-size: 8px;
  font-weight: 700;
  text-anchor: middle;
  letter-spacing: 0.5px;
}

.limit-line-red {
  stroke: $color-brand-red;
  stroke-width: 1.5;
}

.limit-label-red {
  fill: $color-brand-red;
  font-size: 8px;
  font-weight: 700;
  text-anchor: end;
}

.chart-area {
  fill: rgba(34, 197, 232, 0.12);
}

.chart-polyline {
  fill: none;
  stroke: $color-chart-accent;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tap-target {
  fill: transparent;
  cursor: pointer;
}

.point-pulse-today {
  fill: rgba(14, 33, 56, 0.2);
}

.point-pulse-exceeded {
  fill: rgba(230, 55, 87, 0.25);
}

.point-dot {
  cursor: pointer;
  transition: transform 0.1s ease;

  &.dot-normal {
    fill: $color-chart-accent;
    stroke: white;
    stroke-width: 1.5;
  }

  &.dot-today {
    fill: $color-primary-navy;
    stroke: white;
    stroke-width: 2;
  }

  &.dot-exceeded {
    fill: $color-brand-red;
    stroke: white;
    stroke-width: 2;
  }
}

.x-axis-label {
  font-size: 9px;
  fill: #6B7280;
  text-anchor: middle;
  font-weight: 500;

  &.label-today {
    font-weight: 800;
    fill: $color-primary-navy;
  }
}

// Tooltip
.tooltip-box {
  fill: rgba(14, 33, 56, 0.95);
}

.tooltip-date {
  fill: #CBD5E1;
  font-size: 8px;
  text-anchor: middle;
}

.tooltip-val {
  fill: white;
  font-size: 9px;
  font-weight: 700;
  text-anchor: middle;
}

.point-detail-chip {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: $color-text-primary;

  .chip-date {
    font-weight: 700;
    color: $color-primary-navy;
  }

  .chip-badge-exceeded {
    font-size: 10px;
    font-weight: 700;
    color: $color-brand-red;
    background: rgba(230, 55, 87, 0.12);
    padding: 2px 6px;
    border-radius: 4px;
  }
}
</style>
