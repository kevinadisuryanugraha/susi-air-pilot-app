<template>
  <nav class="bottom-nav">
    <NuxtLink to="/" class="nav-item" :class="{ active: currentRoute === '/' }">
      <Home :size="22" stroke-width="2" />
      <span>Home</span>
    </NuxtLink>

    <NuxtLink to="/schedule" class="nav-item" :class="{ active: currentRoute.startsWith('/schedule') }">
      <Calendar :size="22" stroke-width="2" />
      <span>Schedule</span>
    </NuxtLink>

    <NuxtLink to="/logbook" class="nav-item" :class="{ active: currentRoute.startsWith('/logbook') }">
      <BookOpen :size="22" stroke-width="2" />
      <span>Logbook</span>
    </NuxtLink>

    <NuxtLink to="/more" class="nav-item" :class="{ active: currentRoute.startsWith('/more') }">
      <Menu :size="22" stroke-width="2" />
      <span>More</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { Home, Calendar, BookOpen, Menu } from 'lucide-vue-next';

const route = useRoute();
const currentRoute = computed(() => route.path);
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 440px;
  height: 68px;
  background-color: $color-card-surface;
  border-top: 1px solid $color-border;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 12px 10px;
  z-index: 100;
  box-shadow: 0 -4px 16px rgba(14, 33, 56, 0.06);

  @media (max-width: 480px) {
    max-width: 100%;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: $color-text-secondary;
  font-size: 11px;
  font-weight: 500;
  gap: 4px;
  padding: 4px 12px;
  border-radius: $radius-sm;
  transition: all 0.2s ease;

  &.active {
    color: $color-brand-red;
    font-weight: 700;

    svg {
      stroke: $color-brand-red;
    }
  }

  &:hover {
    color: $color-primary-navy;
  }
}
</style>
