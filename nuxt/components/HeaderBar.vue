<template>
  <header class="app-header">

    <!-- Top bar: logo + date + signout -->
    <div class="header-top">
      <div class="brand">
        <img src="/images/logo.png" alt="Susi Air" class="brand-logo" />
      </div>

      <div class="header-right">
        <div class="date-chip">
          <span class="chip-dot"></span>
          <span class="chip-value tabular">2026-05-15</span>
        </div>
        <button class="btn-signout" title="Sign Out" @click="handleLogout">
          <LogOut :size="15" />
        </button>
      </div>
    </div>

    <!-- Pilot profile card — large, filled, premium -->
    <div class="pilot-card">
      <div class="pilot-avatar-wrap">
        <img
          :src="authStore.pilot?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&q=80'"
          :alt="authStore.pilot?.name || 'Pilot'"
          class="pilot-avatar"
        />
      </div>

      <div class="pilot-info">
        <span class="greeting">Good Day, Captain ✈</span>
        <h1 class="pilot-name">{{ authStore.pilot?.name || 'John Doe' }}</h1>

        <div class="pilot-stats">
          <div class="stat-item">
            <Clock :size="11" />
            <span class="stat-val tabular font-bold">{{ formatHours(authStore.pilot?.totalFlightHours) }}</span>
            <span class="stat-lbl">hrs total</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="live-dot"></span>
            <span class="stat-val" style="color: #1FBF8F; font-weight: 700;">Active</span>
          </div>
        </div>
      </div>

      <!-- Decorative plane silhouette -->
      <div class="card-deco">✈</div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { LogOut, Clock } from 'lucide-vue-next';

const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
}

function formatHours(val: number | undefined): string {
  if (val === undefined || val === null) return '1,444.5';
  return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
</script>

<style scoped lang="scss">
// ============================================================
// APP HEADER — Aviation Premium / Full Navy Command Bar
// ============================================================

.app-header {
  position: relative;
  overflow: hidden;

  // Deep navy-to-sky gradient — distinct from page, feels like cockpit
  background: linear-gradient(
    160deg,
    #0E2138 0%,
    #143154 40%,
    #1E4A78 75%,
    #2A6096 100%
  );

  padding: 16px 20px 20px;
  border-bottom-left-radius: 26px;
  border-bottom-right-radius: 26px;
  box-shadow: 0 8px 32px rgba(14, 33, 56, 0.35), 0 2px 8px rgba(14, 33, 56, 0.2);

  @media (max-width: 375px) {
    padding: 14px 16px 18px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
  }

  // Aviation radar grid overlay (subtle white lines)
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }

  // Bottom cyan accent glow
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1.5px;
    background: linear-gradient(90deg, transparent 0%, #22C5E8 30%, #22C5E8 70%, transparent 100%);
  }
}

// ---- Top Bar ----
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.brand {
  .brand-logo {
    height: 26px;
    width: auto;
    object-fit: contain;
    // Force white — logo.png on dark bg
    filter: brightness(0) invert(1);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: $radius-pill;
  padding: 5px 11px;

  .chip-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: $color-chart-accent;
    flex-shrink: 0;
  }

  .chip-value {
    font-size: 11px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.3px;
  }
}

.btn-signout {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: $transition-smooth;

  &:hover {
    color: #FF8096;
    background: rgba(230, 55, 87, 0.25);
    border-color: rgba(230, 55, 87, 0.4);
  }
}

// ---- Pilot Card ----
.pilot-card {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 16px;

  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  padding: 16px 18px;

  // Glass reflection highlight
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 4px 16px rgba(0, 0, 0, 0.2);

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  overflow: hidden;
}

.pilot-avatar-wrap {
  flex-shrink: 0;

  .pilot-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
    // Ring menggunakan box-shadow: cyan ring luar + shadow gelap
    box-shadow:
      0 0 0 3px rgba(34, 197, 232, 0.9),
      0 0 0 5px rgba(34, 197, 232, 0.2),
      0 6px 20px rgba(0, 0, 0, 0.4);
  }
}

.pilot-info {
  flex: 1;
  min-width: 0;
}

.greeting {
  display: block;
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 600;
  margin-bottom: 2px;
}

.pilot-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: white;
  margin-bottom: 10px;
  line-height: 1.1;
}

.pilot-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: $radius-pill;
  padding: 5px 12px;
  width: fit-content;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.8);

  svg { opacity: 0.8; }

  .stat-val {
    font-size: 12px;
    font-weight: 700;
    color: white;
  }

  .stat-lbl {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.55);
    font-weight: 500;
  }
}

.stat-divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.2);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: $color-success;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(31,191,143,0.4); }
  50% { opacity: 0.8; transform: scale(0.9); box-shadow: 0 0 0 4px rgba(31,191,143,0); }
}

// Decorative plane — top right of card
.card-deco {
  position: absolute;
  right: 16px;
  top: 12px;
  font-size: 48px;
  opacity: 0.06;
  transform: rotate(-15deg);
  line-height: 1;
  pointer-events: none;
  user-select: none;
}
</style>
