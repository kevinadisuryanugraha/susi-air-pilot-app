<template>
  <header class="cockpit-header">
    <!-- Telemetry HUD Top Strip -->
    <div class="hud-top-strip">
      <div class="zulu-clock">
        <span class="pulse-beacon"></span>
        <span class="utc-text mono">07:15 UTC</span>
        <span class="sep">•</span>
        <span class="wib-text mono">14:15 WIB</span>
      </div>

      <div class="flight-ops-status">
        <span class="ops-badge">
          <PlaneTakeoff :size="12" class="plane-icon" />
          <span>OPS ACTIVE</span>
        </span>
        <button class="signout-hud-btn" title="Sign Out Pilot Account" @click="handleLogout">
          <LogOut :size="14" />
        </button>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="header-nav">
      <div class="brand-group">
        <img src="/images/logo-white.png" alt="Susi Air Logo" class="brand-logo" />
        <div class="brand-divider"></div>
        <div class="portal-badge">
          <span class="portal-title">PILOT APP</span>
          <span class="portal-sub">EFB v1.0</span>
        </div>
      </div>
    </div>

    <!-- Pilot Profile Card (Cockpit ID / Epaulet Insignia) -->
    <div class="pilot-cockpit-card">
      <div class="pilot-avatar-container">
        <div class="avatar-ring">
          <img
            :src="authStore.pilot?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160'"
            alt="Pilot Avatar"
            class="pilot-avatar"
          />
        </div>
        <div class="rank-epaulet" title="Captain - 4 Gold Stripes">
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
          <span class="stripe"></span>
        </div>
      </div>

      <div class="pilot-credentials">
        <div class="role-line">
          <span class="rank-title">CAPTAIN</span>
          <span class="dot">·</span>
          <span class="callsign mono">PIC C208B</span>
        </div>

        <h1 class="pilot-name">{{ authStore.pilot?.name || 'John Doe' }}</h1>

        <div class="flight-hours-telemetry">
          <div class="telemetry-pill">
            <Clock :size="13" class="clock-icon" />
            <span class="hours-val tabular mono">{{ authStore.pilot?.totalFlightHours ?? '1444.5' }}</span>
            <span class="hours-unit">TOTAL HRS</span>
          </div>

          <div class="medical-class-pill">
            <ShieldCheck :size="13" class="shield-icon" />
            <span>CLASS 1 FIT</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { PlaneTakeoff, LogOut, Clock, ShieldCheck } from 'lucide-vue-next';

const authStore = useAuthStore();

function handleLogout() {
  if (confirm('Sign out from Susi Air Pilot Operations?')) {
    authStore.logout();
  }
}
</script>

<style scoped lang="scss">
.cockpit-header {
  background: linear-gradient(180deg, #071526 0%, #0E2138 60%, #152E4D 100%);
  color: white;
  padding: 12px 18px 22px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  box-shadow: $shadow-cockpit-glow;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(34, 197, 232, 0.4) 50%, transparent 100%);
  }
}

// HUD Top Strip
.hud-top-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.zulu-clock {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);

  .pulse-beacon {
    width: 6px;
    height: 6px;
    background-color: $color-success;
    border-radius: 50%;
    box-shadow: 0 0 8px $color-success;
    animation: pulse 2s infinite;
  }

  .utc-text {
    font-weight: 700;
    color: #38BDF8;
  }

  .sep {
    opacity: 0.4;
  }

  .wib-text {
    color: rgba(255, 255, 255, 0.6);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.flight-ops-status {
  display: flex;
  align-items: center;
  gap: 8px;

  .ops-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #4ADE80;
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 2px 7px;
    border-radius: $radius-pill;

    .plane-icon {
      color: #4ADE80;
    }
  }

  .signout-hud-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(230, 55, 87, 0.25);
      color: $color-brand-red;
    }
  }
}

// Header Navigation
.header-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 12px;

  .brand-logo {
    height: 32px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
  }

  .brand-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.18);
  }

  .portal-badge {
    display: flex;
    flex-direction: column;

    .portal-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      color: white;
    }

    .portal-sub {
      font-size: 9px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 0.5px;
    }
  }
}

// Pilot Profile Cockpit Card
.pilot-cockpit-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 12px 14px;
  backdrop-filter: blur(10px);
}

.pilot-avatar-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  .avatar-ring {
    width: 62px;
    height: 62px;
    border-radius: 50%;
    padding: 2px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 158, 11, 0.8) 50%, rgba(34, 197, 232, 0.6) 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .pilot-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: block;
    }
  }

  // 4 Gold Captain Epaulet Stripes
  .rank-epaulet {
    display: flex;
    flex-direction: column;
    gap: 1.5px;
    background: #0B131D;
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid rgba(245, 158, 11, 0.5);
    margin-top: -6px;
    z-index: 2;

    .stripe {
      width: 16px;
      height: 2px;
      background: linear-gradient(90deg, #F59E0B 0%, #FDE68A 50%, #D97706 100%);
      border-radius: 1px;
    }
  }
}

.pilot-credentials {
  flex: 1;
  min-width: 0;

  .role-line {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    color: #FBBF24;
    letter-spacing: 0.8px;

    .dot {
      opacity: 0.5;
    }

    .callsign {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .pilot-name {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.4px;
    color: white;
    margin: 1px 0 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .flight-hours-telemetry {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .telemetry-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.35);
      padding: 3px 8px;
      border-radius: $radius-pill;
      font-size: 11px;

      .clock-icon {
        color: #38BDF8;
      }

      .hours-val {
        font-weight: 800;
        color: white;
      }

      .hours-unit {
        font-size: 8px;
        font-weight: 700;
        color: rgba(255, 255, 255, 0.6);
        letter-spacing: 0.5px;
      }
    }

    .medical-class-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 3px 7px;
      border-radius: $radius-pill;
      font-size: 9px;
      font-weight: 700;
      color: #34D399;
      letter-spacing: 0.4px;

      .shield-icon {
        color: #34D399;
      }
    }
  }
}
</style>
