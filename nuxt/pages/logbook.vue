<template>
  <div class="placeholder-page">
    <HeaderBar />

    <div class="empty-content">
      <div class="icon-bubble">
        <BookOpen :size="36" />
      </div>
      <h3 class="placeholder-title">Electronic Flight Logbook</h3>
      <p class="placeholder-desc">
        Flight legs logging, block hours verification, and digital sign-off features are scheduled for Release v1.2.
      </p>
      <NuxtLink to="/" class="back-home-btn">
        Return to Cockpit Dashboard
      </NuxtLink>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next';
</script>

<style scoped lang="scss">
.placeholder-page {
  display: flex;
  flex-direction: column;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 24px;

  .icon-bubble {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(14, 33, 56, 0.08);
    color: $color-primary-navy;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .placeholder-title {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
    margin-bottom: 8px;
  }

  .placeholder-desc {
    font-size: 13px;
    color: $color-text-secondary;
    line-height: 1.5;
    max-width: 320px;
    margin-bottom: 24px;
  }

  .back-home-btn {
    padding: 10px 22px;
    background: $color-primary-navy;
    color: white;
    font-weight: 700;
    font-size: 13px;
    border-radius: $radius-pill;
    text-decoration: none;

    &:hover {
      background: #152C4A;
    }
  }
}
</style>
