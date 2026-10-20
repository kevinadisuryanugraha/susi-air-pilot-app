<template>
  <section class="hours-to-limit">
    <div class="section-title-bar">
      <div class="title-meta">
        <span class="hud-eyebrow">CASR PART 121 / 135 DUTY MONITOR</span>
        <h2 class="title-text">Hours to Limit</h2>
      </div>
      <div class="anchor-date-chip" title="Regulatory Evaluation Anchor Date">
        <CalendarCheck :size="12" />
        <span class="mono">15 MAY 2026</span>
      </div>
    </div>

    <!-- 4 Telemetry Regulatory Duty Cards -->
    <div class="telemetry-cards-grid">
      <div
        v-for="card in store.summary?.cards || []"
        :key="card.type"
        class="telemetry-card"
        :class="[`gauge-${card.status}`]"
      >
        <div class="card-header-row">
          <div class="label-group">
            <span class="window-type-badge">{{ card.label.replace(' Limit', '') }}</span>
            <span class="window-rule mono">{{ card.windowDescription }}</span>
          </div>

          <span class="status-indicator-tag" :class="[`tag-${card.status}`]">
            {{ card.status === 'danger' ? 'LIMIT BREACH' : card.status === 'warning' ? 'CAUTION' : 'AIRWORTHY' }}
          </span>
        </div>

        <div class="card-metric-row">
          <div class="dial-numbers">
            <span class="current-val mono font-bold tabular">{{ card.currentHours }}</span>
            <span class="metric-divider">/</span>
            <span class="limit-val mono tabular">{{ card.limit }}<span class="unit">h</span></span>
          </div>
          <span class="ratio-percent mono font-bold">{{ card.percentage }}%</span>
        </div>

        <!-- 10-Segment Cockpit Gauge Bar -->
        <div class="cockpit-gauge-track">
          <div
            v-for="seg in 10"
            :key="seg"
            class="gauge-segment"
            :class="{
              active: (card.percentage / 10) >= seg,
              exceeded: card.isExceeded,
              warning: !card.isExceeded && card.status === 'warning' && (card.percentage / 10) >= seg,
              safe: !card.isExceeded && card.status === 'safe' && (card.percentage / 10) >= seg
            }"
          ></div>
        </div>

        <div class="card-buffer-row">
          <span class="buffer-label">Operational Margin:</span>
          <span
            class="buffer-value mono font-bold"
            :class="card.isExceeded ? 'text-danger' : 'text-success'"
          >
            {{ card.isExceeded ? `-${(card.currentHours - card.limit).toFixed(1)}h OVER` : `+${card.remainingHours}h buffer` }}
          </span>
        </div>
      </div>
    </div>

    <!-- High-Precision Telemetry Trend Chart Card -->
    <div class="telemetry-chart-card">
      <div class="chart-top-bar">
        <div class="chart-meta">
          <div class="chart-heading-wrap">
            <Activity :size="15" class="chart-icon" />
            <h3 class="chart-heading">Rolling Duty Curve</h3>
          </div>
          <p class="chart-desc">15-day continuous sliding window · Center: Today</p>
        </div>

        <!-- Animated Range Toggle Pills: 1w, 1m, 3m, 6m, 1y -->
        <div class="range-switch-group">
          <button
            v-for="r in rangeOptions"
            :key="r"
            class="range-pill"
            :class="{ active: store.selectedRange === r }"
            @click="handleRangeChange(r)"
          >
            {{ r.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Telemetry Sub-bar -->
      <div class="chart-sub-strip">
        <div class="strip-item">
          <span class="dot-swatch swatch-cyan"></span>
          <span>Rolling Window: <strong class="mono">{{ store.summary?.chart?.windowDays }} Days</strong></span>
        </div>
        <div class="strip-item">
          <span class="dot-swatch swatch-red"></span>
          <span>Ceiling Limit: <strong class="mono text-red">{{ store.summary?.chart?.limitLine }}.0h</strong></span>
        </div>
      </div>

      <!-- Interactive SVG Spline Chart -->
      <div class="svg-stage-wrapper">
        <div v-if="store.isLoading" class="chart-loading-overlay">
          <div class="radar-spinner"></div>
          <span class="loading-label mono">CALCULATING SLIDING WINDOW ON SERVER...</span>
        </div>

        <svg
          v-else-if="chartPoints.length > 0"
          class="cockpit-spline-svg"
          viewBox="0 0 380 220"
          preserveAspectRatio="xMidYMid meet"
          @mousemove="handlePointerMove"
          @touchmove="handleTouchMove"
          @mouseleave="activePoint = null"
        >
          <defs>
            <!-- Neon Cyan Glow Filter -->
            <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <!-- Red Limit Glow Filter -->
            <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <!-- Gradient Area Fill -->
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.35" />
              <stop offset="60%" stop-color="#06B6D4" stop-opacity="0.08" />
              <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.00" />
            </linearGradient>

            <linearGradient id="today-pillar-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0E2138" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#0E2138" stop-opacity="0.02" />
            </linearGradient>
          </defs>

          <!-- Subtle Horizontal Grid Lines -->
          <line
            v-for="tick in yTicks"
            :key="`grid-${tick.val}`"
            :x1="padding.left"
            :y1="tick.y"
            :x2="svgWidth - padding.right"
            :y2="tick.y"
            class="hud-grid-line"
          />

          <!-- Y-axis numeric labels -->
          <text
            v-for="tick in yTicks"
            :key="`lbl-${tick.val}`"
            :x="padding.left - 6"
            :y="tick.y + 3.5"
            class="y-axis-hud-text mono"
          >
            {{ tick.val }}
          </text>

          <!-- TODAY Column Indicator Pillar -->
          <g v-if="todayPoint">
            <rect
              :x="todayPoint.x - 11"
              :y="padding.top - 12"
              width="22"
              :height="plotHeight + 12"
              rx="4"
              fill="url(#today-pillar-gradient)"
            />
            <line
              :x1="todayPoint.x"
              :y1="padding.top - 12"
              :x2="todayPoint.x"
              :y2="svgHeight - padding.bottom"
              class="today-beacon-axis"
            />
            <rect
              :x="todayPoint.x - 18"
              :y="padding.top - 24"
              width="36"
              height="15"
              rx="4"
              class="today-flag-bg"
            />
            <text
              :x="todayPoint.x"
              :y="padding.top - 13"
              class="today-flag-text mono"
            >
              TODAY
            </text>
          </g>

          <!-- Regulatory Ceiling Limit Line (Glowing Red Dashed Line) -->
          <line
            :x1="padding.left"
            :y1="limitY"
            :x2="svgWidth - padding.right"
            :y2="limitY"
            class="ceiling-limit-line"
            filter="url(#red-glow)"
          />
          <g>
            <rect
              :x="svgWidth - padding.right - 58"
              :y="limitY - 14"
              width="58"
              height="12"
              rx="3"
              class="ceiling-tag-bg"
            />
            <text
              :x="svgWidth - padding.right - 29"
              :y="limitY - 5"
              class="ceiling-tag-text mono"
            >
              MAX {{ store.summary?.chart?.limitLine }}h
            </text>
          </g>

          <!-- Area Fill below Spline Curve -->
          <path :d="areaSplinePath" fill="url(#area-gradient)" />

          <!-- Main Curved Bézier Spline Line -->
          <path
            :d="curveSplinePath"
            class="curve-spline"
            filter="url(#cyan-glow)"
          />

          <!-- Vertical Crosshair Scanning Line on Hover/Touch -->
          <line
            v-if="hoveredPoint"
            :x1="hoveredPoint.x"
            :y1="padding.top - 10"
            :x2="hoveredPoint.x"
            :y2="svgHeight - padding.bottom"
            class="crosshair-scan-line"
          />

          <!-- Data Points -->
          <g
            v-for="(pt, idx) in chartPoints"
            :key="`pt-${pt.date}`"
            class="point-group"
            @mouseenter="hoveredPoint = pt"
            @click="hoveredPoint = pt"
          >
            <!-- Large transparent touch area -->
            <circle :cx="pt.x" :cy="pt.y" r="14" fill="transparent" class="point-touch-target" />

            <!-- Exceeded pulse aura -->
            <circle
              v-if="pt.isExceeded"
              :cx="pt.x"
              :cy="pt.y"
              r="7"
              class="pulse-exceeded-ring"
            />

            <!-- Point Center Ring -->
            <circle
              :cx="pt.x"
              :cy="pt.y"
              :r="pt.isToday ? 5 : (hoveredPoint?.date === pt.date ? 5 : 3.5)"
              :class="[
                'spline-dot',
                pt.isExceeded ? 'dot-red' : (pt.isToday ? 'dot-navy' : 'dot-cyan'),
                hoveredPoint?.date === pt.date ? 'dot-hovered' : ''
              ]"
            />

            <!-- X-Axis Day Numbers -->
            <text
              :x="pt.x"
              :y="svgHeight - padding.bottom + 17"
              class="x-axis-day-label mono tabular"
              :class="{ 'day-today': pt.isToday }"
            >
              {{ pt.dayNumber }}
            </text>
          </g>

          <!-- Floating HUD Telemetry Readout Box -->
          <g v-if="hoveredPoint" class="hud-tooltip-overlay">
            <rect
              :x="tooltipX"
              :y="tooltipY"
              width="116"
              height="40"
              rx="6"
              class="hud-tooltip-card"
            />
            <text :x="tooltipX + 58" :y="tooltipY + 14" class="tooltip-header mono">
              {{ hoveredPoint.date }} {{ hoveredPoint.isToday ? '• TODAY' : '' }}
            </text>
            <text :x="tooltipX + 58" :y="tooltipY + 28" class="tooltip-body mono">
              {{ hoveredPoint.rollingSum }}h <tspan class="sub-day">({{ hoveredPoint.dailyHours }}h day)</tspan>
            </text>
          </g>
        </svg>

        <!-- Live Telemetry Card Info Box below chart -->
        <div class="active-telemetry-chip">
          <div class="chip-col">
            <span class="c-label">Inspected Point</span>
            <span class="c-val mono">{{ activeOrCurrentPoint.formattedDate }}</span>
          </div>

          <div class="chip-divider"></div>

          <div class="chip-col">
            <span class="c-label">Rolling Sum</span>
            <span class="c-val mono font-bold" :class="activeOrCurrentPoint.isExceeded ? 'text-danger' : 'text-cyan'">
              {{ activeOrCurrentPoint.rollingSum }} hrs
            </span>
          </div>

          <div class="chip-divider"></div>

          <div class="chip-col">
            <span class="c-label">Daily Log</span>
            <span class="c-val mono">{{ activeOrCurrentPoint.dailyHours }} hrs</span>
          </div>

          <span v-if="activeOrCurrentPoint.isExceeded" class="exceeded-badge mono">
            ⚠️ BREACH
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useFlightHoursStore, type ChartSeriesPoint } from '~/stores/flightHours';
import { CalendarCheck, Activity } from 'lucide-vue-next';

const store = useFlightHoursStore();
const rangeOptions = ['1w', '1m', '3m', '6m', '1y'] as const;

const hoveredPoint = ref<any | null>(null);

const svgWidth = 380;
const svgHeight = 220;
const padding = { top: 36, right: 24, bottom: 38, left: 34 };

const plotWidth = svgWidth - padding.left - padding.right;
const plotHeight = svgHeight - padding.top - padding.bottom;

onMounted(() => {
  if (!store.summary) {
    store.fetchSummary('1w');
  }
});

function handleRangeChange(r: '1w' | '1m' | '3m' | '6m' | '1y') {
  hoveredPoint.value = null;
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

const activeOrCurrentPoint = computed(() => {
  return hoveredPoint.value || todayPoint.value || chartPoints.value[7] || {
    formattedDate: '15 May 2026',
    rollingSum: 25.2,
    dailyHours: 6.4,
    isExceeded: false,
  };
});

// Catmull-Rom to Cubic Bézier Spline Curve Generator
const curveSplinePath = computed(() => {
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

const areaSplinePath = computed(() => {
  const pts = chartPoints.value;
  if (pts.length === 0) return '';
  const first = pts[0];
  const last = pts[pts.length - 1];
  const baseline = svgHeight - padding.bottom;
  return `${curveSplinePath.value} L ${last.x},${baseline} L ${first.x},${baseline} Z`;
});

// Tooltip positioning
const tooltipX = computed(() => {
  if (!hoveredPoint.value) return 0;
  const x = hoveredPoint.value.x - 58;
  return Math.max(10, Math.min(svgWidth - 126, x));
});

const tooltipY = computed(() => {
  if (!hoveredPoint.value) return 0;
  const y = hoveredPoint.value.y - 48;
  return Math.max(8, y);
});

function handlePointerMove(e: MouseEvent) {
  const svg = e.currentTarget as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  const scale = svgWidth / rect.width;
  const mouseX = (e.clientX - rect.left) * scale;
  findClosestPoint(mouseX);
}

function handleTouchMove(e: TouchEvent) {
  if (e.touches.length === 0) return;
  const touch = e.touches[0];
  const svg = e.currentTarget as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  const scale = svgWidth / rect.width;
  const touchX = (touch.clientX - rect.left) * scale;
  findClosestPoint(touchX);
}

function findClosestPoint(x: number) {
  if (chartPoints.value.length === 0) return;
  let closest = chartPoints.value[0];
  let minDiff = Math.abs(x - closest.x);

  for (const pt of chartPoints.value) {
    const diff = Math.abs(x - pt.x);
    if (diff < minDiff) {
      minDiff = diff;
      closest = pt;
    }
  }
  hoveredPoint.value = closest;
}
</script>

<style scoped lang="scss">
.hours-to-limit {
  padding: 18px 20px 22px;
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;

  .hud-eyebrow {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #0284C7;
    display: block;
    margin-bottom: 2px;
  }

  .title-text {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.4px;
  }
}

.anchor-date-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  background: white;
  color: #334155;
  padding: 4px 10px;
  border-radius: $radius-pill;
  border: 1px solid $color-border;
  box-shadow: $shadow-sm;
}

// 4 Telemetry Cards
.telemetry-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.telemetry-card {
  background: white;
  border-radius: $radius-card;
  padding: 14px 12px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: $transition-default;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #CBD5E1;
  }

  &.gauge-safe::before { background: $color-success; }
  &.gauge-warning::before { background: $color-warning; }
  &.gauge-danger::before {
    background: $color-danger;
    box-shadow: 0 0 10px $color-danger-glow;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-elevated;
  }
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;

  .label-group {
    display: flex;
    flex-direction: column;

    .window-type-badge {
      font-size: 12px;
      font-weight: 800;
      color: $color-primary-navy;
      letter-spacing: -0.2px;
    }

    .window-rule {
      font-size: 9px;
      color: $color-text-secondary;
      margin-top: 1px;
    }
  }

  .status-indicator-tag {
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: $radius-pill;

    &.tag-safe {
      background: rgba(16, 185, 129, 0.12);
      color: #059669;
    }
    &.tag-warning {
      background: rgba(245, 158, 11, 0.12);
      color: #D97706;
    }
    &.tag-danger {
      background: rgba(230, 55, 87, 0.15);
      color: #E63757;
      animation: pulse 1.8s infinite;
    }
  }
}

.card-metric-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 10px;

  .dial-numbers {
    display: flex;
    align-items: baseline;
    gap: 3px;

    .current-val {
      font-size: 18px;
      font-weight: 800;
      color: $color-primary-navy;
    }

    .metric-divider {
      color: #CBD5E1;
      font-size: 13px;
    }

    .limit-val {
      font-size: 13px;
      font-weight: 700;
      color: $color-text-secondary;

      .unit {
        font-size: 10px;
        color: $color-text-muted;
      }
    }
  }

  .ratio-percent {
    font-size: 11px;
    color: #475569;
  }
}

// 10-Segment Cockpit Gauge Bar
.cockpit-gauge-track {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2.5px;
  height: 6px;
  margin-bottom: 8px;

  .gauge-segment {
    background-color: #E2E8F0;
    border-radius: 1.5px;
    transition: background-color 0.25s ease;

    &.active.safe { background-color: $color-success; }
    &.active.warning { background-color: $color-warning; }
    &.active.exceeded {
      background-color: $color-danger;
      box-shadow: 0 0 4px $color-danger-glow;
    }
  }
}

.card-buffer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;

  .buffer-label {
    color: $color-text-secondary;
  }

  .buffer-value {
    letter-spacing: 0.2px;

    &.text-success { color: #059669; }
    &.text-danger { color: $color-danger; }
  }
}

// Telemetry Trend Chart Card
.telemetry-chart-card {
  background: white;
  border-radius: $radius-card;
  padding: 16px 14px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
}

.chart-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.chart-heading-wrap {
  display: flex;
  align-items: center;
  gap: 6px;

  .chart-icon {
    color: #06B6D4;
  }

  .chart-heading {
    font-size: 14px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.2px;
  }
}

.chart-desc {
  font-size: 10px;
  color: $color-text-secondary;
  margin-top: 1px;
}

// Animated Range Pill Switcher
.range-switch-group {
  display: flex;
  background: #F1F5F9;
  border-radius: $radius-pill;
  padding: 2.5px;
  gap: 2px;

  .range-pill {
    padding: 3px 8px;
    font-size: 10px;
    font-weight: 800;
    color: #64748B;
    border-radius: $radius-pill;
    transition: $transition-default;

    &.active {
      background: $color-primary-navy;
      color: white;
      box-shadow: 0 2px 6px rgba(14, 33, 56, 0.25);
    }
  }
}

.chart-sub-strip {
  display: flex;
  justify-content: flex-end;
  gap: 14px;
  font-size: 10px;
  color: $color-text-secondary;
  margin-bottom: 12px;

  .strip-item {
    display: flex;
    align-items: center;
    gap: 5px;

    .dot-swatch {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.swatch-cyan {
        background-color: #06B6D4;
        box-shadow: 0 0 6px $color-chart-glow;
      }
      &.swatch-red {
        background-color: $color-danger;
        box-shadow: 0 0 6px $color-danger-glow;
      }
    }

    .text-red { color: $color-danger; }
  }
}

.svg-stage-wrapper {
  position: relative;
  width: 100%;
}

.chart-loading-overlay {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .radar-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(14, 33, 56, 0.1);
    border-top-color: #06B6D4;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-label {
    font-size: 10px;
    font-weight: 700;
    color: $color-text-secondary;
    letter-spacing: 0.8px;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.cockpit-spline-svg {
  width: 100%;
  height: auto;
  overflow: visible;
  cursor: crosshair;
}

.hud-grid-line {
  stroke: #F1F5F9;
  stroke-width: 1;
  stroke-dasharray: 3, 3;
}

.y-axis-hud-text {
  font-size: 9px;
  fill: #94A3B8;
  text-anchor: end;
  font-weight: 600;
}

.today-beacon-axis {
  stroke: rgba(14, 33, 56, 0.4);
  stroke-width: 1.5;
  stroke-dasharray: 2, 2;
}

.today-flag-bg {
  fill: $color-primary-navy;
}

.today-flag-text {
  fill: white;
  font-size: 8px;
  font-weight: 800;
  text-anchor: middle;
  letter-spacing: 0.5px;
}

.ceiling-limit-line {
  stroke: $color-danger;
  stroke-width: 1.8;
  stroke-dasharray: 4, 3;
}

.ceiling-tag-bg {
  fill: $color-danger;
}

.ceiling-tag-text {
  fill: white;
  font-size: 7.5px;
  font-weight: 800;
  text-anchor: middle;
  letter-spacing: 0.5px;
}

.curve-spline {
  fill: none;
  stroke: #06B6D4;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.crosshair-scan-line {
  stroke: #0284C7;
  stroke-width: 1.2;
  stroke-dasharray: 2, 2;
}

.point-touch-target {
  cursor: pointer;
}

.pulse-exceeded-ring {
  fill: none;
  stroke: $color-danger;
  stroke-width: 1.5;
  opacity: 0.8;
  animation: pulseRing 1.5s infinite;
}

@keyframes pulseRing {
  0% { r: 5px; opacity: 1; }
  100% { r: 10px; opacity: 0; }
}

.spline-dot {
  transition: all 0.15s ease;
  stroke-width: 2;

  &.dot-cyan {
    fill: #06B6D4;
    stroke: white;
  }

  &.dot-navy {
    fill: $color-primary-navy;
    stroke: white;
  }

  &.dot-red {
    fill: $color-danger;
    stroke: white;
  }

  &.dot-hovered {
    transform: scale(1.3);
  }
}

.x-axis-day-label {
  font-size: 9px;
  fill: #64748B;
  text-anchor: middle;
  font-weight: 600;

  &.day-today {
    font-weight: 800;
    fill: $color-primary-navy;
  }
}

// Tooltip
.hud-tooltip-card {
  fill: rgba(7, 21, 38, 0.95);
  stroke: rgba(6, 182, 212, 0.5);
  stroke-width: 1;
}

.tooltip-header {
  fill: #94A3B8;
  font-size: 8px;
  font-weight: 700;
  text-anchor: middle;
  letter-spacing: 0.5px;
}

.tooltip-body {
  fill: white;
  font-size: 10px;
  font-weight: 800;
  text-anchor: middle;

  .sub-day {
    fill: #38BDF8;
    font-size: 8.5px;
    font-weight: 600;
  }
}

// Active telemetry chip bottom readout
.active-telemetry-chip {
  margin-top: 12px;
  padding: 8px 14px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .chip-col {
    display: flex;
    flex-direction: column;

    .c-label {
      font-size: 8.5px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .c-val {
      font-size: 12px;
      font-weight: 800;
      color: $color-primary-navy;
      margin-top: 1px;

      &.text-cyan { color: #0284C7; }
      &.text-danger { color: $color-danger; }
    }
  }

  .chip-divider {
    width: 1px;
    height: 20px;
    background: #E2E8F0;
  }

  .exceeded-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: rgba(230, 55, 87, 0.15);
    color: $color-danger;
    border: 1px solid rgba(230, 55, 87, 0.3);
    padding: 3px 8px;
    border-radius: $radius-pill;
    animation: pulse 1.8s infinite;
  }
}
</style>
