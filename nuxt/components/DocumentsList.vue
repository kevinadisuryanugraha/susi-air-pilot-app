<template>
  <section class="documents-section">
    <div class="section-header anim-fade-up delay-4">
      <div>
        <h2 class="section-title">My Documents</h2>
        <p class="section-subtitle">Certifications & validity tracking</p>
      </div>
      <span class="count-badge">{{ store.documents.length }} docs</span>
    </div>

    <!-- Skeleton loading -->
    <div v-if="store.isLoading" class="docs-skeleton">
      <div v-for="i in 3" :key="i" class="skeleton-card">
        <div class="skeleton" style="width: 40px; height: 40px; border-radius: 12px;"></div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <div class="skeleton" style="height: 13px; width: 60%;"></div>
          <div class="skeleton" style="height: 11px; width: 40%;"></div>
        </div>
        <div class="skeleton" style="width: 50px; height: 22px; border-radius: 9999px;"></div>
      </div>
    </div>

    <div v-else class="documents-list">
      <div
        v-for="(doc, idx) in store.documents"
        :key="doc.id"
        class="doc-card anim-fade-up"
        :class="`status-${doc.status}`"
        :style="{ animationDelay: `${0.05 * idx + 0.28}s` }"
      >
        <!-- Left status stripe -->
        <div class="status-stripe" :style="{ backgroundColor: doc.badgeColor }"></div>

        <!-- Icon -->
        <div class="doc-icon-wrap" :style="{ backgroundColor: `${doc.badgeColor}14`, color: doc.badgeColor }">
          <component :is="getDocIcon(doc.label)" :size="17" />
        </div>

        <!-- Info -->
        <div class="doc-body">
          <h4 class="doc-name">{{ doc.label }}</h4>
          <div class="doc-meta">
            <CalendarDays :size="10" />
            <span>Exp <strong class="tabular">{{ formatDate(doc.expiryDate) }}</strong></span>
            <span class="dot">·</span>
            <span class="days-left" :style="{ color: doc.badgeColor }">{{ doc.statusLabel }}</span>
          </div>
        </div>

        <!-- Badge -->
        <span
          class="urgency-badge"
          :style="{
            background: `${doc.badgeColor}16`,
            color: doc.badgeColor,
            borderColor: `${doc.badgeColor}35`
          }"
        >
          {{ doc.status.toUpperCase() }}
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDocumentsStore } from '~/stores/documents';
import {
  FileCheck2, ShieldCheck, FileText, Stethoscope, CalendarDays
} from 'lucide-vue-next';

const store = useDocumentsStore();

onMounted(() => {
  if (store.documents.length === 0) {
    store.fetchDocuments();
  }
});

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function getDocIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('license') || l.includes('licence')) return FileCheck2;
  if (l.includes('medical')) return Stethoscope;
  if (l.includes('security') || l.includes('clearance')) return ShieldCheck;
  if (l.includes('recurrent') || l.includes('ppc')) return FileText;
  return FileText;
}
</script>

<style scoped lang="scss">
.documents-section {
  padding: 20px 16px 8px;

  @media (max-width: 375px) {
    padding: 16px 12px 8px;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;

  .section-title {
    font-size: 17px;
    font-weight: 800;
    color: $color-text-primary;
    letter-spacing: -0.4px;
  }

  .section-subtitle {
    font-size: 11.5px;
    color: $color-text-muted;
    margin-top: 2px;
    font-weight: 500;
  }
}

.count-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: $color-primary-navy;
  background: $color-chart-accent-bg;
  border: 1px solid rgba(34, 197, 232, 0.25);
  padding: 4px 10px;
  border-radius: $radius-pill;
}

// Skeleton
.docs-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $color-card-surface;
  border-radius: $radius-card;
  padding: 14px 16px;
  border: 1px solid $color-border;
}

// Document List
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.doc-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: $color-card-surface;
  border-radius: $radius-card;
  padding: 14px 14px 14px 0;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  overflow: hidden;
  position: relative;
  transition: $transition-smooth;

  &:hover {
    box-shadow: $shadow-card-hover;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.status-stripe {
  width: 4px;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  border-radius: 0 2px 2px 0;
}

.doc-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 14px;
}

.doc-body {
  flex: 1;
  min-width: 0;

  .doc-name {
    font-size: 13.5px;
    font-weight: 700;
    color: $color-text-primary;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: $color-text-muted;
    font-weight: 500;

    strong {
      font-weight: 700;
      color: $color-text-secondary;
    }

    .dot {
      color: $color-border-strong;
    }

    .days-left {
      font-weight: 700;
    }
  }
}

.urgency-badge {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  padding: 4px 9px;
  border-radius: $radius-pill;
  border: 1px solid;
  flex-shrink: 0;
  margin-right: 2px;
}
</style>
