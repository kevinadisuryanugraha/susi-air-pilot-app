<template>
  <div class="more-page">
    <HeaderBar />

    <div class="more-content">
      <div class="version-banner">
        <h3 class="app-name">Susi Air Pilot Operations</h3>
        <span class="version-tag">Build v1.0.0-rc2 (Candidate Test)</span>
      </div>

      <div class="menu-list">
        <div class="menu-item">
          <Plane :size="18" class="m-icon" />
          <div class="m-text">
            <span class="m-title">Aircraft Fleet Readiness</span>
            <span class="m-sub">Cessna 208B, Piaggio P180 Avanti II</span>
          </div>
          <ChevronRight :size="16" class="m-arr" />
        </div>

        <div class="menu-item">
          <ShieldCheck :size="18" class="m-icon" />
          <div class="m-text">
            <span class="m-title">Safety Management System (SMS)</span>
            <span class="m-sub">DGCA & CASR Compliance Records</span>
          </div>
          <ChevronRight :size="16" class="m-arr" />
        </div>

        <div class="menu-item">
          <FileCode :size="18" class="m-icon" />
          <div class="m-text">
            <span class="m-title">API Server Status</span>
            <span class="m-sub">{{ config.public.apiBase }}</span>
          </div>
          <span class="online-indicator">Online</span>
        </div>
      </div>

      <div class="actions-box">
        <button class="logout-full-btn" @click="authStore.logout">
          <LogOut :size="16" />
          <span>Sign Out Pilot Account</span>
        </button>
      </div>

      <div class="copyright-box">
        <p>© 2026 PT ASI Pudjiastuti Aviation</p>
        <p>Developed for Technical Evaluation by Kevin Adisurya Nugraha</p>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { Plane, ShieldCheck, FileCode, ChevronRight, LogOut } from 'lucide-vue-next';

const authStore = useAuthStore();
const config = useRuntimeConfig();
</script>

<style scoped lang="scss">
.more-page {
  display: flex;
  flex-direction: column;
}

.more-content {
  padding: 16px 20px 24px;
}

.version-banner {
  background: white;
  border-radius: $radius-card;
  padding: 16px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  margin-bottom: 14px;
  text-align: center;

  .app-name {
    font-size: 15px;
    font-weight: 800;
    color: $color-primary-navy;
  }

  .version-tag {
    font-size: 11px;
    font-weight: 600;
    color: $color-brand-red;
    background: rgba(230, 55, 87, 0.1);
    padding: 2px 8px;
    border-radius: $radius-pill;
    display: inline-block;
    margin-top: 4px;
  }
}

.menu-list {
  background: white;
  border-radius: $radius-card;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  overflow: hidden;
  margin-bottom: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
  border-bottom: 1px solid #F3F4F6;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #FAFAFA;
  }

  .m-icon {
    color: $color-primary-navy;
    flex-shrink: 0;
  }

  .m-text {
    flex: 1;
    display: flex;
    flex-direction: column;

    .m-title {
      font-size: 13px;
      font-weight: 700;
      color: $color-primary-navy;
    }

    .m-sub {
      font-size: 11px;
      color: $color-text-secondary;
      margin-top: 1px;
    }
  }

  .m-arr {
    color: $color-text-muted;
  }

  .online-indicator {
    font-size: 10px;
    font-weight: 700;
    color: #0E805D;
    background: rgba(31, 191, 143, 0.15);
    padding: 2px 8px;
    border-radius: $radius-pill;
  }
}

.actions-box {
  .logout-full-btn {
    width: 100%;
    padding: 12px;
    background: white;
    color: $color-brand-red;
    border: 1px solid rgba(230, 55, 87, 0.3);
    border-radius: $radius-pill;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:hover {
      background: #FFF5F7;
    }
  }
}

.copyright-box {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  color: $color-text-muted;
  line-height: 1.5;
}
</style>
