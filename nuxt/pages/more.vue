<template>
  <div class="more-page">
    <HeaderBar />

    <div class="more-content">
      <!-- App Identity Card -->
      <div class="app-banner anim-fade-up delay-1">
        <div class="app-logo-row">
          <div class="app-icon">✈</div>
          <div class="app-meta">
            <span class="app-name">Susi Air Pilot Operations</span>
            <span class="version-chip">v1.0.0-rc2 · Candidate Test</span>
          </div>
        </div>
        <div class="server-row">
          <span class="server-label">API</span>
          <span class="server-url tabular">{{ config.public.apiBase }}</span>
          <span class="online-badge">● Online</span>
        </div>
      </div>

      <!-- Section: Operations -->
      <div class="menu-section anim-fade-up delay-2">
        <p class="menu-section-title">Operations</p>
        <div class="menu-list">
          <div class="menu-item" v-for="item in opsItems" :key="item.title">
            <div class="menu-icon-wrap" :style="{ background: item.iconBg, color: item.iconColor }">
              <component :is="item.icon" :size="17" />
            </div>
            <div class="m-text">
              <span class="m-title">{{ item.title }}</span>
              <span class="m-sub">{{ item.sub }}</span>
            </div>
            <ChevronRight :size="15" class="m-arr" />
          </div>
        </div>
      </div>

      <!-- Section: System -->
      <div class="menu-section anim-fade-up delay-3">
        <p class="menu-section-title">System</p>
        <div class="menu-list">
          <div class="menu-item">
            <div class="menu-icon-wrap" style="background: rgba(34,197,232,0.1); color: #0E7696;">
              <Activity :size="17" />
            </div>
            <div class="m-text">
              <span class="m-title">Regulatory Framework</span>
              <span class="m-sub">CASR Part 121 · DGCA Indonesia</span>
            </div>
            <ChevronRight :size="15" class="m-arr" />
          </div>
          <div class="menu-item">
            <div class="menu-icon-wrap" style="background: rgba(31,191,143,0.1); color: #0E805D;">
              <Lock :size="17" />
            </div>
            <div class="m-text">
              <span class="m-title">Session Security</span>
              <span class="m-sub">JWT Bearer · Token-based Auth</span>
            </div>
            <span class="secure-badge">Secured</span>
          </div>
        </div>
      </div>

      <!-- Sign out -->
      <div class="anim-fade-up delay-4">
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="16" />
          <span>Sign Out</span>
        </button>
      </div>

      <!-- Footer -->
      <div class="copyright-box anim-fade-up delay-5">
        <p>© 2026 PT ASI Pudjiastuti Aviation</p>
        <p>Built by Kevin Adisurya Nugraha · Technical Evaluation</p>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import {
  Plane, ShieldCheck, ChevronRight, LogOut, Activity, Lock
} from 'lucide-vue-next';

const authStore = useAuthStore();
const config = useRuntimeConfig();

const opsItems = [
  {
    icon: Plane,
    title: 'Aircraft Fleet Readiness',
    sub: 'Cessna 208B · Piaggio P180 Avanti II',
    iconBg: 'rgba(14, 33, 56, 0.08)',
    iconColor: '#0E2138',
  },
  {
    icon: ShieldCheck,
    title: 'Safety Management System',
    sub: 'SMS · DGCA & CASR Compliance',
    iconBg: 'rgba(230, 55, 87, 0.08)',
    iconColor: '#E63757',
  },
];

function handleLogout() {
  authStore.logout();
}
</script>

<style scoped lang="scss">
.more-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.more-content {
  padding: 16px 16px 84px;

  @media (max-width: 375px) {
    padding: 12px 12px 84px;
  }
}

// ---- App Banner ----
.app-banner {
  background: $color-card-surface;
  border-radius: $radius-card-lg;
  padding: 16px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  margin-bottom: 20px;
}

.app-logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .app-icon {
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, $color-primary-navy 0%, $color-navy-muted 100%);
    color: white;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: $shadow-card;
  }

  .app-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .app-name {
      font-size: 14px;
      font-weight: 800;
      color: $color-primary-navy;
      letter-spacing: -0.3px;
    }

    .version-chip {
      font-size: 10.5px;
      font-weight: 700;
      color: $color-brand-red;
      background: rgba(230, 55, 87, 0.08);
      border: 1px solid rgba(230, 55, 87, 0.2);
      padding: 2px 8px;
      border-radius: $radius-pill;
      display: inline-block;
      width: fit-content;
    }
  }
}

.server-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: $color-bg;
  border-radius: $radius-sm;
  border: 1px solid $color-border;

  .server-label {
    font-size: 9.5px;
    font-weight: 800;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    background: $color-border;
    padding: 1px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .server-url {
    flex: 1;
    font-size: 11px;
    color: $color-text-secondary;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .online-badge {
    font-size: 10px;
    font-weight: 700;
    color: $color-success;
    flex-shrink: 0;
  }
}

// ---- Menu Sections ----
.menu-section {
  margin-bottom: 20px;

  .menu-section-title {
    font-size: 11px;
    font-weight: 800;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
    padding-left: 4px;
  }
}

.menu-list {
  background: $color-card-surface;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 13px 14px;
  gap: 12px;
  border-bottom: 1px solid $color-border;
  cursor: pointer;
  transition: $transition-smooth;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: $color-bg;
  }

  &:active {
    background: $color-overlay;
  }
}

.menu-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.m-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  .m-title {
    font-size: 13.5px;
    font-weight: 700;
    color: $color-text-primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .m-sub {
    font-size: 11px;
    color: $color-text-muted;
    margin-top: 2px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.m-arr {
  color: $color-border-strong;
  flex-shrink: 0;
}

.secure-badge {
  font-size: 10px;
  font-weight: 700;
  color: $color-success;
  background: $color-success-bg;
  border: 1px solid rgba(31, 191, 143, 0.25);
  padding: 3px 8px;
  border-radius: $radius-pill;
  flex-shrink: 0;
}

// ---- Logout ----
.logout-btn {
  width: 100%;
  padding: 13px;
  background: $color-card-surface;
  color: $color-brand-red;
  border: 1.5px solid rgba(230, 55, 87, 0.3);
  border-radius: $radius-pill;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: $shadow-xs;
  transition: $transition-smooth;
  margin-bottom: 0;

  &:hover {
    background: rgba(230, 55, 87, 0.05);
    border-color: $color-brand-red;
    box-shadow: 0 4px 12px rgba(230, 55, 87, 0.15);
  }
}

// ---- Copyright ----
.copyright-box {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  color: $color-text-muted;
  line-height: 1.7;
  font-weight: 500;
}
</style>
