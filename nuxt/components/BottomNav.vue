<template>
  <nav class="bottom-nav">
    <NuxtLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-item"
      :class="{ active: isActive(item) }"
    >
      <div class="nav-icon-wrap">
        <component :is="item.icon" :size="20" />
        <span v-if="isActive(item)" class="active-dot"></span>
      </div>
      <span class="nav-label">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { Home, Calendar, BookOpen, Grip } from 'lucide-vue-next';

const route = useRoute();

const navItems = [
  { path: '/',         label: 'Home',     icon: Home,     exact: true },
  { path: '/schedule', label: 'Schedule', icon: Calendar,  exact: false },
  { path: '/logbook',  label: 'Logbook',  icon: BookOpen,  exact: false },
  { path: '/more',     label: 'More',     icon: Grip,      exact: false },
];

function isActive(item: typeof navItems[0]) {
  if (item.exact) return route.path === item.path;
  return route.path.startsWith(item.path);
}
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 440px;
  // Height + safe-area for iPhone home indicator
  height: calc(74px + env(safe-area-inset-bottom, 0px));
  background-color: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(14, 33, 56, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  // Padding top for icon area, bottom absorbs safe-area
  padding: 8px 8px 0;
  padding-bottom: env(safe-area-inset-bottom, 10px);
  z-index: 100;
  box-shadow: $shadow-nav;

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
  color: $color-text-muted;
  font-size: 10.5px;
  font-weight: 500;
  gap: 4px;
  flex: 1;
  padding: 4px 0;
  transition: $transition-smooth;
  position: relative;

  &.active {
    color: $color-brand-red;

    .nav-icon-wrap {
      background: rgba(230, 55, 87, 0.09);
      transform: translateY(-2px);
    }
  }

  &:hover:not(.active) {
    color: $color-primary-navy;

    .nav-icon-wrap {
      background: rgba(14, 33, 56, 0.05);
    }
  }

  &:active {
    transform: scale(0.92);
  }
}

.nav-icon-wrap {
  width: 44px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: $transition-smooth;
  position: relative;
}

.active-dot {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background-color: $color-brand-red;
  border-radius: 50%;
  animation: fadeIn 0.25s ease-out;
}

.nav-label {
  line-height: 1;
  transition: $transition-smooth;
}
</style>
