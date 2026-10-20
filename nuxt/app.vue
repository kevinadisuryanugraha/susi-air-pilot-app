<template>
  <div v-if="isAuthPage" class="auth-fullscreen-viewport">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>

  <div v-else class="app-viewport">
    <NuxtRouteAnnouncer />
    <main class="main-content">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const isAuthPage = computed(() => route.path === '/login');
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
</style>
