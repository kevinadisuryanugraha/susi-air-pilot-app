<template>
  <section class="documents-vault-section">
    <div class="section-title-bar">
      <div class="title-meta">
        <span class="hud-eyebrow">DGCA / CASR REGULATORY VAULT</span>
        <h2 class="title-text">Aviation Credentials</h2>
      </div>
      <div class="verified-count-chip">
        <ShieldCheck :size="12" class="shield-green" />
        <span class="mono">{{ store.documents.length }} CREDENTIALS</span>
      </div>
    </div>

    <div v-if="store.isLoading" class="vault-loading">
      <div class="radar-spinner"></div>
      <span class="mono">VERIFYING PILOT CREDENTIALS...</span>
    </div>

    <div v-else class="credentials-vault-grid">
      <div
        v-for="doc in store.documents"
        :key="doc.id"
        class="credential-card"
        :class="[`vault-status-${doc.status}`]"
      >
        <!-- Card Left Chip Graphic & Category Icon -->
        <div class="card-left-badge" :style="{ backgroundColor: `${doc.badgeColor}15`, color: doc.badgeColor, borderColor: `${doc.badgeColor}35` }">
          <Award v-if="doc.id.includes('license') || doc.id.includes('ppc')" :size="20" />
          <HeartPulse v-else-if="doc.id.includes('medical')" :size="20" />
          <ShieldAlert v-else-if="doc.id.includes('security')" :size="20" />
          <FileCheck2 v-else :size="20" />
        </div>

        <!-- Center Details -->
        <div class="credential-info">
          <div class="doc-header-line">
            <h4 class="doc-name">{{ doc.label }}</h4>
          </div>

          <div class="doc-meta-row">
            <span class="meta-date mono">EXP: {{ formatAviationDate(doc.expiryDate) }}</span>
            <span class="sep">•</span>
            <span class="countdown-tag mono font-bold" :style="{ color: doc.badgeColor }">
              {{ formatCountdown(doc.daysRemaining) }}
            </span>
          </div>
        </div>

        <!-- Right Urgency Seal Badge -->
        <div class="urgency-seal-wrap">
          <span
            class="urgency-seal"
            :style="{
              backgroundColor: `${doc.badgeColor}18`,
              color: doc.badgeColor,
              borderColor: `${doc.badgeColor}40`
            }"
          >
            {{ doc.status === 'expired' ? 'GROUNDED' : (doc.status === 'soon' ? 'DUE SOON' : 'VALID') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDocumentsStore } from '~/stores/documents';
import { ShieldCheck, Award, HeartPulse, ShieldAlert, FileCheck2 } from 'lucide-vue-next';

const store = useDocumentsStore();

onMounted(() => {
  if (store.documents.length === 0) {
    store.fetchDocuments();
  }
});

function formatAviationDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${d} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function formatCountdown(days: number): string {
  if (days <= 0) return `${Math.abs(days)}d OVERDUE`;
  if (days === 1) return `1 DAY LEFT`;
  return `${days} DAYS LEFT`;
}
</script>

<style scoped lang="scss">
.documents-vault-section {
  padding: 0 20px 24px;
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;

  .hud-eyebrow {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #0284C7;
    display: block;
    margin-bottom: 2px;
  }

  .title-text {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.4px;
  }
}

.verified-count-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  background: white;
  color: #334155;
  padding: 4px 10px;
  border-radius: $radius-pill;
  border: 1px solid $color-border;
  box-shadow: $shadow-sm;

  .shield-green {
    color: $color-success;
  }
}

.vault-loading {
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 10px;
  font-weight: 700;
  color: $color-text-secondary;

  .radar-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(14, 33, 56, 0.1);
    border-top-color: #0284C7;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.credentials-vault-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.credential-card {
  background: white;
  border-radius: $radius-card;
  padding: 12px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: $transition-default;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3.5px;
    background: #CBD5E1;
  }

  &.vault-status-safe::before { background: $color-success; }
  &.vault-status-soon::before { background: $color-warning; }
  &.vault-status-expired {
    background: linear-gradient(90deg, rgba(254, 242, 242, 0.6) 0%, #FFFFFF 100%);
    border-color: rgba(230, 55, 87, 0.35);

    &::before {
      background: $color-danger;
      box-shadow: 0 0 8px $color-danger-glow;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-elevated;
  }
}

.card-left-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  flex-shrink: 0;
}

.credential-info {
  flex: 1;
  min-width: 0;

  .doc-name {
    font-size: 13.5px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-meta-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 3px;

    .meta-date {
      font-size: 10px;
      color: #64748B;
    }

    .sep {
      opacity: 0.3;
    }

    .countdown-tag {
      font-size: 10px;
    }
  }
}

.urgency-seal-wrap {
  flex-shrink: 0;

  .urgency-seal {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.8px;
    padding: 3px 8px;
    border-radius: $radius-pill;
    border: 1px solid;
    text-transform: uppercase;
  }
}
</style>
