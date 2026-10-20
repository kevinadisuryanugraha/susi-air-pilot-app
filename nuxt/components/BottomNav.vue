<template>
  <nav class="bottom-nav">
    <NuxtLink to="/" class="nav-item" :class="{ active: currentRoute === '/' }">
      <div class="icon-wrap">
        <LayoutDashboard :size="20" stroke-width="2.2" />
        <span class="active-dot" v-if="currentRoute === '/'"></span>
      </div>
      <span class="nav-label">Dashboard</span>
    </NuxtLink>

    <NuxtLink to="/schedule" class="nav-item" :class="{ active: currentRoute.startsWith('/schedule') }">
      <div class="icon-wrap">
        <CalendarDays :size="20" stroke-width="2.2" />
        <span class="active-dot" v-if="currentRoute.startsWith('/schedule')"></span>
      </div>
      <span class="nav-label">Roster</span>
    </NuxtLink>

    <NuxtLink to="/logbook" class="nav-item" :class="{ active: currentRoute.startsWith('/logbook') }">
      <div class="icon-wrap">
        <BookOpenCheck :size="20" stroke-width="2.2" />
        <span class="active-dot" v-if="currentRoute.startsWith('/logbook')"></span>
      </div>
      <span class="nav-label">Logbook</span>
    </NuxtLink>

    <NuxtLink to="/more" class="nav-item" :class="{ active: currentRoute.startsWith('/more') }">
      <div class="icon-wrap">
        <SlidersHorizontal :size="20" stroke-width="2.2" />
        <span class="active-dot" v-if="currentRoute.startsWith('/more')"></span>
      </div>
      <span class="nav-label">Aircraft</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, CalendarDays, BookOpenCheck, SlidersHorizontal } from 'lucide-vue-next';

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
  height: 66px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 6px 12px 10px;
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(14, 33, 56, 0.08);

  @media (max-width: 480px) {
    max-width: 100%;
  }

  @media (min-width: 481px) {
    border-bottom-left-radius: 28px;
    border-bottom-right-radius: 28px;
  }
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #64748B;
  font-size: 10.5px;
  font-weight: 600;
  gap: 3px;
  padding: 4px 14px;
  border-radius: 12px;
  transition: $transition-default;
  position: relative;

  .icon-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 24px;

    .active-dot {
      position: absolute;
      bottom: -3px;
      width: 4px;
      height: 4px;
      background: $color-brand-red;
      border-radius: 50%;
      box-shadow: 0 0 6px $color-brand-red;
    }
  }

  &.active {
    color: $color-brand-red;
    font-weight: 800;

    svg {
      color: $color-brand-red;
      transform: translateY(-1px);
    }
  }

  &:hover {
    color: $color-primary-navy;
  }
}
</style>
