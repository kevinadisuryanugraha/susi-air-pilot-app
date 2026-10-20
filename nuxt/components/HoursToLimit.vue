<template>
  <section class="hours-to-limit">
    <div class="section-header">
      <div>
        <h2 class="section-title">Hours to Limit</h2>
        <p class="section-subtitle">Current flight hours vs. regulatory limits</p>
      </div>
      <span class="ref-date-badge tabular">Ref: {{ store.summary?.today || '2026-05-15' }}</span>
    </div>

    <!-- 4 Clean Limit Summary Cards -->
    <div class="cards-grid">
      <div
        v-for="card in store.summary?.cards || []"
        :key="card.type"
        class="summary-card"
        :class="{ 'card-exceeded': card.isExceeded }"
      >
        <div class="card-head">
          <span class="card-name">{{ card.label.replace(' Limit', '') }}</span>
          <span class="window-desc">{{ card.windowDescription }}</span>
        </div>

        <div class="card-metric">
          <span class="hours-current tabular font-bold">{{ card.currentHours }}</span>
          <span class="hours-sep">/</span>
          <span class="hours-limit tabular">{{ card.limit }}<span class="unit">h</span></span>
        </div>

        <!-- Clean Solid Progress Bar -->
        <div class="progress-track">
          <div
            class="progress-bar"
            :style="{
              width: `${Math.min(100, card.percentage)}%`,
              backgroundColor: card.isExceeded ? '#E63757' : (card.percentage >= 80 ? '#F59E0B' : '#1FBF8F')
            }"
          ></div>
        </div>

        <div class="card-foot">
          <span class="rem-text" :class="{ 'text-danger': card.isExceeded }">
            {{ card.isExceeded ? `Over limit by ${(card.currentHours - card.limit).toFixed(1)}h` : `${card.remainingHours}h remaining` }}
          </span>
          <span class="pct-text tabular font-semibold">{{ card.percentage }}%</span>
        </div>
      </div>
    </div>

    <!-- Flight Hours Trend Chart Card -->
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Hours Trend</h3>
          <p class="chart-sub">15-day window with today centered</p>
        </div>

        <!-- Clean iOS-style Segmented Control -->
        <div class="segmented-control">
          <button
            v-for="r in rangeOptions"
            :key="r"
            class="segment-btn"
            :class="{ active: store.selectedRange === r }"
            @click="handleRangeChange(r)"
          >
            {{ r }}
          </button>
        </div>
      </div>

      <!-- Chart Legend Info -->
      <div class="chart-legend-row">
        <div class="legend-item">
          <span class="legend-indicator cyan"></span>
          <span>Rolling Sum ({{ store.summary?.chart?.windowDays }}d)</span>
        </div>
        <div class="legend-item">
          <span class="legend-indicator red"></span>
          <span>Limit: <strong class="tabular">{{ store.summary?.chart?.limitLine }}h</strong></span>
        </div>
      </div>

      <!-- SVG Chart -->
      <div class="chart-canvas-wrapper">
        <div v-if="store.isLoading" class="chart-loading">
          <div class="spinner"></div>
          <span>Loading chart...</span>
        </div>

        <svg
          v-else-if="chartPoints.length > 0"
          class="trend-svg"
          viewBox="0 0 380 210"
          preserveAspectRatio="xMidYMid meet"
          @mouseleave="activePoint = null"
        >
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#22C5E8" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#22C5E8" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Horizontal Grid Lines -->
          <line
            v-for="tick in yTicks"
            :key="`ytick-${tick.val}`"
            :x1="padding.left"
            :y1="tick.y"
            :x2="svgWidth - padding.right"
            :y2="tick.y"
            class="grid-line"
          />

          <!-- Y-axis numeric labels -->
          <text
            v-for="tick in yTicks"
            :key="`ylabel-${tick.val}`"
            :x="padding.left - 6"
            :y="tick.y + 3.5"
            class="y-axis-label tabular"
          >
            {{ tick.val }}
          </text>

          <!-- TODAY Column Indicator -->
          <g v-if="todayPoint">
            <line
              :x1="todayPoint.x"
              :y1="padding.top - 8"
              :x2="todayPoint.x"
              :y2="svgHeight - padding.bottom"
              class="today-line"
            />
            <rect
              :x="todayPoint.x - 17"
              :y="padding.top - 20"
              width="34"
              height="15"
              rx="4"
              class="today-badge-rect"
            />
            <text
              :x="todayPoint.x"
              :y="padding.top - 9"
              class="today-badge-text"
            >
              Today
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
            Limit {{ store.summary?.chart?.limitLine }}h
          </text>

          <!-- Area fill under line -->
          <path :d="areaPath" fill="url(#area-gradient)" />

          <!-- Main trend curve -->
          <path :d="linePath" class="trend-line" />

          <!-- Data Points -->
          <g
            v-for="(pt, idx) in chartPoints"
            :key="`pt-${pt.date}`"
            class="point-group"
            @mouseenter="activePoint = pt"
            @click="activePoint = pt"
          >
            <!-- Large transparent target for easy tapping -->
            <circle :cx="pt.x" :cy="pt.y" r="12" fill="transparent" class="point-target" />

            <!-- Circle Dot -->
            <circle
              :cx="pt.x"
              :cy="pt.y"
              :r="pt.isToday ? 4.5 : (activePoint?.date === pt.date ? 4.5 : 3.5)"
              :class="[
                'point-dot',
                pt.isExceeded ? 'dot-exceeded' : (pt.isToday ? 'dot-today' : 'dot-normal')
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

          <!-- Tooltip Box on Hover/Tap -->
          <g v-if="activePoint" class="tooltip-group">
            <rect
              :x="tooltipX"
              :y="tooltipY"
              width="106"
              height="36"
              rx="6"
              class="tooltip-bg"
            />
            <text :x="tooltipX + 53" :y="tooltipY + 14" class="tooltip-text-title">
              {{ activePoint.date }} {{ activePoint.isToday ? '(Today)' : '' }}
            </text>
            <text :x="tooltipX + 53" :y="tooltipY + 28" class="tooltip-text-val tabular">
              {{ activePoint.rollingSum }}h (Day: {{ activePoint.dailyHours }}h)
            </text>
          </g>
        </svg>

        <!-- Inspected Point Detail -->
        <div v-if="activePoint" class="point-readout">
          <span class="readout-date font-semibold">{{ activePoint.formattedDate }}</span>
          <span class="readout-sum">
            Rolling Sum: <strong class="tabular" :class="{ 'text-danger': activePoint.isExceeded }">{{ activePoint.rollingSum }}h</strong>
          </span>
          <span class="readout-daily">
            Daily: <strong class="tabular">{{ activePoint.dailyHours }}h</strong>
          </span>
          <span v-if="activePoint.isExceeded" class="tag-exceeded">
            Limit Exceeded
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
const padding = { top: 32, right: 24, bottom: 34, left: 34 };

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
    const ratio = Math.max(0, pt.rollingSum / yMax.value);
    const y = padding.top + (1 - ratio) * plotHeight;
    const dayNumber = pt.date.slice(8); // 'DD'

    return {
      ...pt,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      dayNumber,
    };
  });
});

const todayPoint = computed(() => {
  return chartPoints.value.find((p) => p.isToday);
});

// Smooth Catmull-Rom to Cubic Bezier Curve
const linePath = computed(() => {
  const pts = chartPoints.value;
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
});

const areaPath = computed(() => {
  const pts = chartPoints.value;
  if (pts.length === 0) return '';
  const first = pts[0];
  const last = pts[pts.length - 1];
  const baseline = svgHeight - padding.bottom;
  return `${linePath.value} L ${last.x},${baseline} L ${first.x},${baseline} Z`;
});

const tooltipX = computed(() => {
  if (!activePoint.value) return 0;
  const x = activePoint.value.x - 53;
  return Math.max(10, Math.min(svgWidth - 116, x));
});

const tooltipY = computed(() => {
  if (!activePoint.value) return 0;
  const y = activePoint.value.y - 42;
  return Math.max(8, y);
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
  margin-bottom: 12px;

  .section-title {
    font-size: 17px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.3px;
  }

  .section-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 1px;
  }

  .ref-date-badge {
    font-size: 10px;
    font-weight: 600;
    color: #475569;
    background-color: #E2E8F0;
    padding: 3px 8px;
    border-radius: $radius-pill;
  }
}

// 4 Cards Grid
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.summary-card {
  background-color: $color-card-surface;
  border-radius: $radius-card;
  padding: 12px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  display: flex;
  flex-direction: column;

  &.card-exceeded {
    border-color: rgba(230, 55, 87, 0.4);
    background-color: #FFF9FA;
  }
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;

  .card-name {
    font-size: 13px;
    font-weight: 700;
    color: $color-primary-navy;
  }

  .window-desc {
    font-size: 10px;
    color: $color-text-secondary;
  }
}

.card-metric {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-bottom: 8px;

  .hours-current {
    font-size: 19px;
    color: $color-primary-navy;
  }

  .hours-sep {
    font-size: 13px;
    color: $color-text-muted;
  }

  .hours-limit {
    font-size: 13px;
    font-weight: 600;
    color: $color-text-secondary;

    .unit {
      font-size: 11px;
      color: $color-text-muted;
    }
  }
}

// Solid Smooth Progress Track
.progress-track {
  height: 6px;
  background-color: #F1F5F9;
  border-radius: $radius-pill;
  overflow: hidden;
  margin-bottom: 6px;

  .progress-bar {
    height: 100%;
    border-radius: $radius-pill;
    transition: width 0.3s ease;
  }
}

.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: $color-text-secondary;

  .rem-text {
    font-weight: 500;

    &.text-danger {
      color: $color-brand-red;
      font-weight: 700;
    }
  }

  .pct-text {
    color: $color-primary-navy;
  }
}

// Chart Card
.chart-card {
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
  margin-bottom: 8px;

  .chart-title {
    font-size: 14px;
    font-weight: 700;
    color: $color-primary-navy;
  }

  .chart-sub {
    font-size: 10px;
    color: $color-text-secondary;
  }
}

// iOS Segmented Control
.segmented-control {
  display: flex;
  background-color: #F1F5F9;
  border-radius: 8px;
  padding: 2px;
  gap: 2px;

  .segment-btn {
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 600;
    color: $color-text-secondary;
    border-radius: 6px;
    background: transparent;

    &.active {
      background-color: $color-primary-navy;
      color: white;
    }
  }
}

.chart-legend-row {
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

    .legend-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.cyan { background-color: $color-chart-accent; }
      &.red { background-color: $color-brand-red; }
    }
  }
}

.chart-canvas-wrapper {
  position: relative;
  width: 100%;
}

.chart-loading {
  height: 180px;
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
    border: 3px solid #E2E8F0;
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
  stroke: #F1F5F9;
  stroke-width: 1;
}

.y-axis-label {
  font-size: 9px;
  fill: #94A3B8;
  text-anchor: end;
  font-weight: 500;
}

.today-line {
  stroke: rgba(14, 33, 56, 0.25);
  stroke-width: 1.5;
  stroke-dasharray: 3, 3;
}

.today-badge-rect {
  fill: $color-primary-navy;
}

.today-badge-text {
  fill: white;
  font-size: 8px;
  font-weight: 700;
  text-anchor: middle;
}

.limit-line-red {
  stroke: $color-brand-red;
  stroke-width: 1.5;
  stroke-dasharray: 4, 3;
}

.limit-label-red {
  fill: $color-brand-red;
  font-size: 8px;
  font-weight: 700;
  text-anchor: end;
}

.trend-line {
  fill: none;
  stroke: $color-chart-accent;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.point-target {
  cursor: pointer;
}

.point-dot {
  cursor: pointer;
  stroke: white;
  stroke-width: 1.5;

  &.dot-normal { fill: $color-chart-accent; }
  &.dot-today { fill: $color-primary-navy; stroke-width: 2; }
  &.dot-exceeded { fill: $color-brand-red; stroke-width: 2; }
}

.x-axis-label {
  font-size: 9px;
  fill: #64748B;
  text-anchor: middle;
  font-weight: 500;

  &.label-today {
    font-weight: 800;
    fill: $color-primary-navy;
  }
}

// Tooltip
.tooltip-bg {
  fill: rgba(14, 33, 56, 0.95);
}

.tooltip-text-title {
  fill: #CBD5E1;
  font-size: 8px;
  text-anchor: middle;
}

.tooltip-text-val {
  fill: white;
  font-size: 9px;
  font-weight: 700;
  text-anchor: middle;
}

.point-readout {
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: $color-text-primary;

  .readout-date {
    color: $color-primary-navy;
  }

  .text-danger {
    color: $color-brand-red;
  }

  .tag-exceeded {
    font-size: 9px;
    font-weight: 700;
    color: $color-brand-red;
    background-color: #FEE2E2;
    padding: 2px 6px;
    border-radius: 4px;
  }
}
</style>
