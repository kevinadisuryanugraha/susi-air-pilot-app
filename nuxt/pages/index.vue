<template>
  <div class="home-page">
    <!-- Header with Pilot Info -->
    <HeaderBar />

    <!-- Hours to Limit (4 Cards + Trend Chart) -->
    <HoursToLimit />

    <!-- My Documents List with Urgency Badges -->
    <DocumentsList />

    <!-- Fixed Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useFlightHoursStore } from '~/stores/flightHours';
import { useDocumentsStore } from '~/stores/documents';

const authStore = useAuthStore();
const flightHoursStore = useFlightHoursStore();
const documentsStore = useDocumentsStore();

onMounted(async () => {
  // Parallel fetch upon entering home screen
  await Promise.all([
    authStore.fetchProfile(),
    flightHoursStore.fetchSummary('1w'),
    documentsStore.fetchDocuments(),
  ]);
});
</script>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
}
</style>
