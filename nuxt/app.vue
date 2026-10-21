<template>
  <div v-if="isAuthPage" class="auth-fullscreen-viewport">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>

  <div v-else class="app-viewport">
    <div v-if="isOffline" class="offline-banner">
      <WifiOff :size="12" />
      <span>Offline Mode • Local roster active</span>
    </div>
    <NuxtRouteAnnouncer />
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { WifiOff } from 'lucide-vue-next';

const route = useRoute();
const isAuthPage = computed(() => route.path === '/login');
const isOffline = ref(false);

onMounted(() => {
  if (typeof window !== 'undefined') {
    isOffline.value = !navigator.onLine;
    window.addEventListener('online', () => {
      isOffline.value = false;
    });
    window.addEventListener('offline', () => {
      isOffline.value = true;
    });
  }
});
</script>

<style scoped lang="scss">
.auth-fullscreen-viewport {
  width: 100%;
  min-height: 100vh;
  background-color: $color-primary-navy;
  display: flex;
  align-items: center;
  justify-content: center;
}

.offline-banner {
  background-color: #FEF3C7;
  color: #B45309;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-bottom: 1px solid #FDE68A;
  z-index: 50;
}
</style>
