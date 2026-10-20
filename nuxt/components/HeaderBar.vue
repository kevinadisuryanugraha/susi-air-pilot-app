<template>
  <header class="app-header">
    <div class="header-top">
      <div class="brand">
        <img src="/images/logo-white.png" alt="Susi Air Logo" class="brand-logo" />
        <span class="brand-tag">PILOT APP</span>
      </div>

      <button class="btn-signout" title="Sign Out" @click="handleLogout">
        <LogOut :size="18" />
      </button>
    </div>

    <div class="pilot-profile">
      <img
        :src="authStore.pilot?.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160'"
        alt="Captain John Doe"
        class="pilot-avatar"
      />

      <div class="pilot-meta">
        <span class="greeting">Good Day, Captain</span>
        <h1 class="pilot-name">{{ authStore.pilot?.name || 'John Doe' }}</h1>
        <div class="hours-badge">
          <Clock :size="13" />
          <span class="tabular font-bold">{{ authStore.pilot?.totalFlightHours ?? '1444.5' }}</span>
          <span class="unit">hrs total</span>
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
  if (confirm('Sign out from Susi Air Pilot App?')) {
    authStore.logout();
  }
}
</script>

<style scoped lang="scss">
.app-header {
  background-color: $color-primary-navy;
  color: white;
  padding: 16px 20px 22px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .brand {
    display: flex;
    align-items: center;
    gap: 8px;

    .brand-logo {
      height: 26px;
      width: auto;
      object-fit: contain;
    }

    .brand-tag {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      background: rgba(255, 255, 255, 0.12);
      color: #E2E8F0;
      padding: 2px 7px;
      border-radius: $radius-pill;
    }
  }

  .btn-signout {
    color: rgba(255, 255, 255, 0.7);
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $color-brand-red;
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

.pilot-profile {
  display: flex;
  align-items: center;
  gap: 14px;

  .pilot-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.85);
  }

  .pilot-meta {
    display: flex;
    flex-direction: column;

    .greeting {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.75);
      font-weight: 500;
    }

    .pilot-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: white;
      margin: 1px 0 6px;
    }

    .hours-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.12);
      padding: 3px 9px;
      border-radius: $radius-pill;
      font-size: 11px;
      width: fit-content;

      .unit {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}
</style>
