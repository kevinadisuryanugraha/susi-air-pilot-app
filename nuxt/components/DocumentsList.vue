<template>
  <section class="documents-section">
    <div class="section-header">
      <div>
        <h2 class="section-title">My Documents</h2>
        <p class="section-subtitle">Pilot certifications and validity dates</p>
      </div>
      <span class="count-badge">{{ store.documents.length }} Documents</span>
    </div>

    <div v-if="store.isLoading" class="loading-box">
      <div class="spinner"></div>
      <span>Loading documents...</span>
    </div>

    <div v-else class="documents-list">
      <div
        v-for="doc in store.documents"
        :key="doc.id"
        class="doc-card"
        :class="[`status-${doc.status}`]"
      >
        <div class="doc-icon" :style="{ backgroundColor: `${doc.badgeColor}15`, color: doc.badgeColor }">
          <FileText :size="18" />
        </div>

        <div class="doc-body">
          <h4 class="doc-name">{{ doc.label }}</h4>
          <div class="doc-meta">
            <span class="expiry-date">Exp: <strong class="tabular">{{ formatDate(doc.expiryDate) }}</strong></span>
            <span class="dot">•</span>
            <span class="days-remaining tabular" :style="{ color: doc.badgeColor }">
              {{ doc.statusLabel }}
            </span>
          </div>
        </div>

        <div class="doc-badge-wrap">
          <span
            class="urgency-badge"
            :style="{
              backgroundColor: `${doc.badgeColor}18`,
              color: doc.badgeColor,
              borderColor: `${doc.badgeColor}40`
            }"
          >
            {{ doc.status.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDocumentsStore } from '~/stores/documents';
import { FileText } from 'lucide-vue-next';

const store = useDocumentsStore();

onMounted(() => {
  if (store.documents.length === 0) {
    store.fetchDocuments();
  }
});

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}
</script>

<style scoped lang="scss">
.documents-section {
  padding: 0 20px 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;

  .section-title {
    font-size: 17px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.3px;
  }

  .section-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 1px;
  }

  .count-badge {
    font-size: 10px;
    font-weight: 600;
    color: #475569;
    background-color: #E2E8F0;
    padding: 3px 8px;
    border-radius: $radius-pill;
  }
}

.loading-box {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: $color-text-secondary;

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #E2E8F0;
    border-top-color: $color-primary-navy;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.doc-card {
  background-color: $color-card-surface;
  border-radius: $radius-card;
  padding: 12px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  display: flex;
  align-items: center;
  gap: 12px;

  &.status-expired {
    border-color: rgba(230, 55, 87, 0.35);
    background-color: #FFF9FA;
  }
}

.doc-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-body {
  flex: 1;
  min-width: 0;

  .doc-name {
    font-size: 13.5px;
    font-weight: 700;
    color: $color-primary-navy;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 2px;

    .dot {
      color: #CBD5E1;
    }

    .days-remaining {
      font-weight: 600;
    }
  }
}

.doc-badge-wrap {
  flex-shrink: 0;

  .urgency-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: $radius-pill;
    border: 1px solid;
    text-transform: uppercase;
  }
}
</style>
