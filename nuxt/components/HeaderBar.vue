<template>
  <header class="header-bar">
    <div class="header-top">
      <div class="brand">
        <img src="/images/logo-white.png" alt="Susi Air Logo" class="brand-logo" />
        <span class="brand-badge">PILOT OPS</span>
      </div>

      <button class="logout-btn" title="Sign Out" @click="handleLogout">
        <LogOut :size="18" />
      </button>
    </div>

    <div class="pilot-card">
      <div class="pilot-avatar-wrapper">
        <img
          :src="authStore.pilot?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120'"
          alt="Pilot Avatar"
          class="pilot-avatar"
        />
        <span class="active-badge" title="Active Duty"></span>
      </div>

      <div class="pilot-info">
        <span class="greeting">Good Day, Captain</span>
        <h2 class="pilot-name">{{ authStore.pilot?.name || 'John Doe' }}</h2>
        <div class="hours-badge">
          <Clock :size="13" />
          <span class="tabular font-bold">{{ authStore.pilot?.totalFlightHours ?? '1444.5' }}</span>
          <span class="hours-unit">hrs total</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { LogOut, Clock } from 'lucide-vue-next';

const authStore = useAuthStore();

function handleLogout() {
  if (confirm('Are you sure you want to sign out from the Pilot App?')) {
    authStore.logout();
  }
}
</script>

<style scoped lang="scss">
.header-bar {
  background: linear-gradient(180deg, $color-primary-navy 0%, #152C4A 100%);
  color: white;
  padding: 16px 20px 24px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 4px 20px rgba(14, 33, 56, 0.15);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;

  .brand-logo {
    height: 30px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.35));
  }

  .brand-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    background: rgba(230, 55, 87, 0.25);
    color: #FFA5B4;
    border: 1px solid rgba(230, 55, 87, 0.4);
    padding: 2px 7px;
    border-radius: $radius-pill;
  }
}

.logout-btn {
  color: rgba(255, 255, 255, 0.7);
  padding: 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: $color-brand-red;
    background: rgba(255, 255, 255, 0.1);
  }
}

.pilot-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pilot-avatar-wrapper {
  position: relative;
  width: 58px;
  height: 58px;

  .pilot-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.85);
  }

  .active-badge {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background-color: $color-success;
    border: 2px solid $color-primary-navy;
    border-radius: 50%;
  }
}

.pilot-info {
  display: flex;
  flex-direction: column;

  .greeting {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 500;
  }

  .pilot-name {
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.3px;
    margin: 1px 0 6px;
  }

  .hours-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 3px 9px;
    border-radius: $radius-pill;
    font-size: 11px;
    width: fit-content;

    .hours-unit {
      color: rgba(255, 255, 255, 0.65);
    }
  }
}
</style>
