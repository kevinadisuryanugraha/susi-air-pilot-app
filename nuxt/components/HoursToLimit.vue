<template>
  <section class="hours-to-limit">
    <!-- Section Header -->
    <div class="section-header anim-fade-up delay-2">
      <div>
        <h2 class="section-title">Hours to Limit</h2>
        <p class="section-subtitle">CASR / DGCA rolling duty windows</p>
      </div>
    </div>

    <!-- 4 Limit Summary Cards -->
    <div class="cards-grid">
      <template v-if="store.isLoading && !store.summary">
        <div v-for="i in 4" :key="i" class="summary-card skeleton-card anim-fade-up" :style="{ animationDelay: `${i * 0.06 + 0.1}s` }">
          <div class="skeleton" style="height: 12px; width: 55%; border-radius: 6px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 22px; width: 70%; border-radius: 6px; margin-bottom: 10px;"></div>
          <div class="skeleton" style="height: 5px; border-radius: 999px;"></div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(card, idx) in store.summary?.cards || []"
          :key="card.type"
          class="summary-card anim-fade-up"
          :class="[`card-${card.status}`, { 'card-exceeded': card.isExceeded }]"
          :style="{ animationDelay: `${idx * 0.07 + 0.1}s` }"
        >
          <!-- Status indicator stripe on top -->
          <div class="card-status-top" :style="{ background: getStatusColor(card) }"></div>

          <!-- Card head -->
          <div class="card-head">
            <div class="card-type-icon" :style="{ background: `${getStatusColor(card)}14`, color: getStatusColor(card) }">
              <component :is="getCardIcon(card.type)" :size="14" />
            </div>
            <span class="card-name">{{ card.label.replace(' Limit', '') }}</span>
          </div>

          <!-- Metric -->
          <div class="card-metric">
            <span class="hours-current tabular font-bold">{{ card.currentHours }}</span>
            <span class="hours-sep">/</span>
            <span class="hours-limit tabular">{{ card.limit }}<span class="unit">h</span></span>
          </div>

          <!-- Progress Bar -->
          <div class="progress-track">
            <div
              class="progress-bar"
              :style="{
                width: `${Math.min(100, card.percentage)}%`,
                background: getProgressGradient(card),
              }"
            ></div>
          </div>

          <!-- Footer -->
          <div class="card-foot">
            <span class="window-desc">{{ card.windowDescription }}</span>
            <span class="pct-text tabular font-bold" :style="{ color: getStatusColor(card) }">
              {{ card.percentage }}%
            </span>
          </div>

          <!-- Exceeded warning -->
          <div v-if="card.isExceeded" class="exceeded-banner">
            <AlertTriangle :size="10" />
            <span>Over by {{ (card.currentHours - card.limit).toFixed(1) }}h</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Flight Hours Trend Chart Card -->
    <div class="chart-card anim-fade-up delay-3">
      <div class="chart-header">
        <div>
          <h3 class="chart-title">Hours Trend</h3>
          <p class="chart-sub">15-day window · Today centered</p>
        </div>

        <!-- Range Toggle -->
        <div class="segmented-control">
          <button
            v-for="r in rangeOptions"
            :key="r"
            class="segment-btn"
            :class="{ active: store.selectedRange === r }"
            @click="handleRangeChange(r)"
          >{{ r }}</button>
        </div>
      </div>

      <!-- Legend -->
      <div class="chart-legend-row">
        <div class="legend-item">
          <span class="legend-line cyan"></span>
          <span>Rolling Sum ({{ store.summary?.chart?.windowDays }}d)</span>
        </div>
        <div class="legend-item">
          <span class="legend-line red dashed"></span>
          <span>Limit: <strong class="tabular">{{ store.summary?.chart?.limitLine }}h</strong></span>
        </div>
      </div>

      <!-- SVG Chart -->
      <div class="chart-canvas-wrapper">
        <div v-if="store.isLoading" class="chart-loading">
          <div class="spinner"></div>
          <span>Calculating rolling sums…</span>
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
              <stop offset="0%" stop-color="#22C5E8" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#22C5E8" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="area-gradient-exceeded" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#E63757" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#E63757" stop-opacity="0.0" />
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

          <!-- Y-axis labels -->
          <text
            v-for="tick in yTicks"
            :key="`ylabel-${tick.val}`"
            :x="padding.left - 6"
            :y="tick.y + 3.5"
            class="y-axis-label tabular"
          >{{ tick.val }}</text>

          <!-- TODAY column indicator -->
          <g v-if="todayPoint">
            <line
              :x1="todayPoint.x"
              :y1="padding.top - 10"
              :x2="todayPoint.x"
              :y2="svgHeight - padding.bottom"
              class="today-line"
            />
            <rect
              :x="todayPoint.x - 18"
              :y="padding.top - 22"
              width="36"
              height="15"
              rx="5"
              class="today-badge-rect"
            />
            <text :x="todayPoint.x" :y="padding.top - 11" class="today-badge-text">Today</text>
          </g>

          <!-- Red Limit Line -->
          <line
            :x1="padding.left"
            :y1="limitY"
            :x2="svgWidth - padding.right"
            :y2="limitY"
            class="limit-line-red"
          />
          <text
            :x="svgWidth - padding.right"
            :y="limitY - 5"
            class="limit-label-red tabular"
          >{{ store.summary?.chart?.limitLine }}h</text>

          <!-- Area Fill -->
          <path :d="areaPath" fill="url(#area-gradient)" />

          <!-- Main Trend Curve -->
          <path :d="linePath" class="trend-line" />

          <!-- Data Points -->
          <g
            v-for="pt in chartPoints"
            :key="`pt-${pt.date}`"
            class="point-group"
            @mouseenter="activePoint = pt"
            @click="activePoint = pt"
          >
            <circle :cx="pt.x" :cy="pt.y" r="14" fill="transparent" class="point-target" />
            <circle
              :cx="pt.x"
              :cy="pt.y"
              :r="pt.isToday ? 5 : (activePoint?.date === pt.date ? 4.5 : 3.5)"
              :class="[
                'point-dot',
                pt.isExceeded ? 'dot-exceeded' : (pt.isToday ? 'dot-today' : 'dot-normal')
              ]"
            />
          </g>

          <!-- X-axis date labels -->
          <text
            v-for="pt in chartPoints"
            :key="`xlabel-${pt.date}`"
            :x="pt.x"
            :y="svgHeight - padding.bottom + 16"
            class="x-axis-label tabular"
            :class="{ 'label-today': pt.isToday }"
          >{{ pt.dayNumber }}</text>

          <!-- Tooltip -->
          <g v-if="activePoint" class="tooltip-group">
            <rect :x="tooltipX" :y="tooltipY" width="112" height="38" rx="8" class="tooltip-bg" />
            <text :x="tooltipX + 56" :y="tooltipY + 14" class="tooltip-text-title">
              {{ activePoint.formattedDate }}{{ activePoint.isToday ? ' · Today' : '' }}
            </text>
            <text :x="tooltipX + 56" :y="tooltipY + 29" class="tooltip-text-val tabular">
              {{ activePoint.rollingSum }}h  ·  Day: {{ activePoint.dailyHours }}h
            </text>
          </g>
        </svg>
      </div>

      <!-- Point Readout -->
      <div v-if="activePoint" class="point-readout anim-fade-in">
        <div class="readout-left">
          <span class="readout-date font-semibold">{{ activePoint.formattedDate }}</span>
          <span class="readout-sum">
            Rolling: <strong class="tabular" :class="{ 'text-danger': activePoint.isExceeded }">{{ activePoint.rollingSum }}h</strong>
          </span>
        </div>
        <div class="readout-right">
          <span class="readout-daily">Daily: <strong class="tabular">{{ activePoint.dailyHours }}h</strong></span>
          <span v-if="activePoint.isExceeded" class="tag-exceeded">
            <AlertTriangle :size="9" />
            Exceeded
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFlightHoursStore, type ChartSeriesPoint, type LimitCard } from '~/stores/flightHours';
import { Clock, CalendarDays, CalendarClock, TrendingUp, AlertTriangle } from 'lucide-vue-next';

const store = useFlightHoursStore();
const rangeOptions = ['1w', '1m', '3m', '6m', '1y'] as const;
const activePoint = ref<any | null>(null);

const svgWidth  = 380;
const svgHeight = 210;
const padding   = { top: 32, right: 28, bottom: 34, left: 34 };

const plotWidth  = svgWidth  - padding.left - padding.right;
const plotHeight = svgHeight - padding.top  - padding.bottom;

onMounted(() => {
  if (!store.summary) store.fetchSummary('1w');
});

function handleRangeChange(r: '1w' | '1m' | '3m' | '6m' | '1y') {
  activePoint.value = null;
  store.fetchSummary(r);
}

function getStatusColor(card: LimitCard): string {
  if (card.isExceeded || card.status === 'danger') return '#E63757';
  if (card.status === 'warning') return '#F59E0B';
  return '#1FBF8F';
}

function getProgressGradient(card: LimitCard): string {
  if (card.isExceeded || card.status === 'danger') return 'linear-gradient(90deg, #E63757, #FF6B85)';
  if (card.status === 'warning') return 'linear-gradient(90deg, #F59E0B, #FBBF24)';
  return 'linear-gradient(90deg, #1FBF8F, #34D399)';
}

function getCardIcon(type: LimitCard['type']) {
  const icons = { daily: Clock, weekly: CalendarDays, monthly: CalendarClock, annual: TrendingUp };
  return icons[type] || Clock;
}

// ---- SVG computed ----
const yMax     = computed(() => store.summary?.chart?.yAxisMax || 45);
const limitLine = computed(() => store.summary?.chart?.limitLine || 40);

const limitY = computed(() =>
  padding.top + (1 - limitLine.value / yMax.value) * plotHeight
);

const yTicks = computed(() => {
  const steps = 4;
  const stepVal = Math.round(yMax.value / steps);
  return Array.from({ length: steps + 1 }, (_, i) => {
    const val = i * stepVal;
    if (val > yMax.value) return null;
    return { val, y: padding.top + (1 - val / yMax.value) * plotHeight };
  }).filter(Boolean) as { val: number; y: number }[];
});

const chartPoints = computed(() => {
  const series = store.summary?.chart?.series || [];
  if (!series.length) return [];
  const count = series.length;
  const stepX = count > 1 ? plotWidth / (count - 1) : 0;
  return series.map((pt: ChartSeriesPoint, idx: number) => ({
    ...pt,
    x: Number((padding.left + idx * stepX).toFixed(2)),
    y: Number((padding.top + (1 - Math.max(0, pt.rollingSum) / yMax.value) * plotHeight).toFixed(2)),
    dayNumber: pt.date.slice(8),
  }));
});

const todayPoint = computed(() => chartPoints.value.find(p => p.isToday));

// Catmull-Rom smooth curve
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
  if (!pts.length) return '';
  const baseline = svgHeight - padding.bottom;
  return `${linePath.value} L ${pts[pts.length-1].x},${baseline} L ${pts[0].x},${baseline} Z`;
});

const tooltipX = computed(() => {
  if (!activePoint.value) return 0;
  return Math.max(10, Math.min(svgWidth - 122, activePoint.value.x - 56));
});
const tooltipY = computed(() => {
  if (!activePoint.value) return 0;
  return Math.max(8, activePoint.value.y - 46);
});
</script>

<style scoped lang="scss">
.hours-to-limit {
  padding: 20px 16px 4px;

  @media (max-width: 375px) {
    padding: 16px 12px 4px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;

  .section-title {
    font-size: 17px;
    font-weight: 800;
    color: $color-text-primary;
    letter-spacing: -0.4px;
  }

  .section-subtitle {
    font-size: 11.5px;
    color: $color-text-muted;
    margin-top: 2px;
    font-weight: 500;
  }
}

// ---- 4 Cards Grid ----
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;

  @media (max-width: 360px) {
    gap: 8px;
  }
}

.summary-card {
  background: $color-card-surface;
  border-radius: $radius-card;
  padding: 13px 13px 11px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: $transition-smooth;
  min-width: 0; /* prevent grid blowout */

  &:hover {
    box-shadow: $shadow-card-hover;
    transform: translateY(-2px);
  }

  &.card-exceeded {
    border-color: rgba(230, 55, 87, 0.3);
    background: #FFFBFB;
  }

  @media (max-width: 360px) {
    padding: 10px 10px 9px;
  }
}

.skeleton-card {
  background: $color-card-surface;
  border-radius: $radius-card;
  padding: 16px;
  border: 1px solid $color-border;
}

.card-status-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0 0 2px 2px;
  opacity: 0.8;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 8px;
  margin-top: 6px;

  .card-type-icon {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card-name {
    font-size: 12.5px;
    font-weight: 700;
    color: $color-text-primary;
    letter-spacing: -0.2px;
  }
}

.card-metric {
  display: flex;
  align-items: baseline;
  gap: 3px;
  margin-bottom: 8px;

  .hours-current {
    font-size: 20px;
    font-weight: 800;
    color: $color-text-primary;
    letter-spacing: -0.5px;
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

.progress-track {
  height: 5px;
  background: $color-bg;
  border-radius: $radius-pill;
  overflow: hidden;
  margin-bottom: 7px;

  .progress-bar {
    height: 100%;
    border-radius: $radius-pill;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .window-desc {
    font-size: 10px;
    color: $color-text-muted;
    font-weight: 500;
  }

  .pct-text {
    font-size: 11px;
  }
}

.exceeded-banner {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  background: rgba(230, 55, 87, 0.1);
  border-radius: $radius-xs;
  padding: 3px 7px;
  font-size: 10px;
  font-weight: 700;
  color: $color-brand-red;
}

// ---- Chart Card ----
.chart-card {
  background: $color-card-surface;
  border-radius: $radius-card;
  padding: 16px 14px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  margin-bottom: 8px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;

  .chart-title {
    font-size: 14px;
    font-weight: 800;
    color: $color-text-primary;
    letter-spacing: -0.3px;
  }

  .chart-sub {
    font-size: 10px;
    color: $color-text-muted;
    margin-top: 1px;
    font-weight: 500;
  }
}

// Segmented control (iOS-style)
.segmented-control {
  display: flex;
  background: $color-bg;
  border-radius: 10px;
  padding: 2px;
  gap: 2px;
  border: 1px solid $color-border;

  .segment-btn {
    padding: 4px 8px;
    font-size: 10.5px;
    font-weight: 600;
    color: $color-text-muted;
    border-radius: 8px;
    transition: $transition-smooth;

    &.active {
      background: $color-primary-navy;
      color: white;
      box-shadow: $shadow-xs;
    }

    &:hover:not(.active) {
      color: $color-text-primary;
    }
  }
}

.chart-legend-row {
  display: flex;
  gap: 16px;
  font-size: 10.5px;
  color: $color-text-muted;
  font-weight: 500;
  margin-bottom: 10px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;

    strong { color: $color-text-primary; }
  }
}

.legend-line {
  display: inline-block;
  width: 16px;
  height: 2.5px;
  border-radius: $radius-pill;

  &.cyan { background-color: $color-chart-accent; }
  &.red  { background-color: $color-brand-red; }
  &.dashed {
    background: repeating-linear-gradient(
      90deg,
      $color-brand-red 0px,
      $color-brand-red 4px,
      transparent 4px,
      transparent 7px
    );
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
  gap: 10px;
  color: $color-text-muted;
  font-size: 12px;
  font-weight: 500;
}

// SVG styles
.trend-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.grid-line {
  stroke: #EBF2F8;
  stroke-width: 1;
}

.y-axis-label {
  font-size: 9px;
  fill: #94A3B8;
  text-anchor: end;
  font-weight: 600;
}

.today-line {
  stroke: rgba(14, 33, 56, 0.2);
  stroke-width: 1.5;
  stroke-dasharray: 3, 3;
}

.today-badge-rect {
  fill: $color-primary-navy;
}

.today-badge-text {
  fill: white;
  font-size: 8px;
  font-weight: 800;
  text-anchor: middle;
}

.limit-line-red {
  stroke: $color-brand-red;
  stroke-width: 1.5;
  stroke-dasharray: 5, 3;
}

.limit-label-red {
  fill: $color-brand-red;
  font-size: 8px;
  font-weight: 800;
  text-anchor: end;
}

.trend-line {
  fill: none;
  stroke: $color-chart-accent;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.point-target { cursor: pointer; }

.point-dot {
  cursor: pointer;
  stroke: white;
  stroke-width: 1.5;
  transition: r 0.15s ease;

  &.dot-normal   { fill: $color-chart-accent; }
  &.dot-today    { fill: $color-primary-navy; stroke-width: 2; }
  &.dot-exceeded { fill: $color-brand-red; stroke-width: 2; }
}

.x-axis-label {
  font-size: 9px;
  fill: #94A3B8;
  text-anchor: middle;
  font-weight: 500;

  &.label-today {
    font-weight: 800;
    fill: $color-primary-navy;
  }
}

.tooltip-bg {
  fill: $color-primary-navy;
  opacity: 0.93;
}

.tooltip-text-title {
  fill: rgba(255,255,255,0.7);
  font-size: 8px;
  text-anchor: middle;
  font-weight: 500;
}

.tooltip-text-val {
  fill: white;
  font-size: 9px;
  font-weight: 700;
  text-anchor: middle;
}

// Point readout below chart
.point-readout {
  margin-top: 10px;
  padding: 10px 13px;
  background: $color-bg;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .readout-left, .readout-right {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 11px;
  }

  .readout-date { color: $color-text-primary; font-size: 12px; }
  .readout-sum, .readout-daily {
    font-size: 11px;
    color: $color-text-muted;
    font-weight: 500;

    strong { color: $color-text-primary; }
  }
  .text-danger { color: $color-brand-red !important; }

  .readout-right { align-items: flex-end; }

  .tag-exceeded {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 9.5px;
    font-weight: 700;
    color: $color-brand-red;
    background: rgba(230, 55, 87, 0.1);
    padding: 2px 7px;
    border-radius: $radius-pill;
  }
}
</style>
