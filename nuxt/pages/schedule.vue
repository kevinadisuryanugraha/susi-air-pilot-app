<template>
  <div class="schedule-page">
    <!-- Header with Pilot Info -->
    <HeaderBar />

    <!-- Monthly Schedule Calendar Component -->
    <ScheduleCalendar />

    <!-- Fixed Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useSchedulesStore } from '~/stores/schedules';

const authStore = useAuthStore();
const schedulesStore = useSchedulesStore();

onMounted(async () => {
  await Promise.all([
    authStore.fetchProfile(),
    schedulesStore.fetchSchedules(),
  ]);
});
</script>

<style scoped lang="scss">
.schedule-page {
  display: flex;
  flex-direction: column;
}
</style>
