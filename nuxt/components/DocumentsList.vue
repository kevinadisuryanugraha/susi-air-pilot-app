<template>
  <section class="documents-section">
    <div class="section-header">
      <div class="title-group">
        <h3 class="section-title">My Documents</h3>
        <p class="section-subtitle">Aviation Certifications & Medical Clearances</p>
      </div>
      <span class="count-badge">{{ store.documents.length }} Files</span>
    </div>

    <div v-if="store.isLoading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading pilot credentials...</span>
    </div>

    <div v-else class="documents-list">
      <div
        v-for="doc in store.documents"
        :key="doc.id"
        class="doc-card"
        :class="[`status-${doc.status}`]"
      >
        <div class="doc-icon-wrap" :style="{ backgroundColor: `${doc.badgeColor}15`, color: doc.badgeColor }">
          <FileText :size="20" />
        </div>

        <div class="doc-content">
          <h4 class="doc-label">{{ doc.label }}</h4>
          <div class="doc-meta">
            <span class="exp-date">Exp: <strong class="tabular">{{ formatDate(doc.expiryDate) }}</strong></span>
            <span class="dot">•</span>
            <span class="days-left tabular" :style="{ color: doc.badgeColor }">
              {{ doc.statusLabel }}
            </span>
          </div>
        </div>

        <div class="badge-wrap">
          <span
            class="status-badge"
            :style="{ backgroundColor: `${doc.badgeColor}20`, color: doc.badgeColor, borderColor: `${doc.badgeColor}40` }"
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
    font-size: 16px;
    font-weight: 700;
    color: $color-primary-navy;
    letter-spacing: -0.2px;
  }

  .section-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 1px;
  }

  .count-badge {
    font-size: 10px;
    font-weight: 600;
    background: #E5E7EB;
    color: #374151;
    padding: 3px 8px;
    border-radius: $radius-pill;
  }
}

.loading-state {
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $color-text-secondary;
  font-size: 12px;

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #E5E7EB;
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
  transition: transform 0.15s ease;

  &.status-expired {
    border-color: rgba(230, 55, 87, 0.35);
    background: linear-gradient(90deg, #FFF9FA 0%, #FFFFFF 100%);
  }
}

.doc-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-content {
  flex: 1;
  min-width: 0;

  .doc-label {
    font-size: 13px;
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
      color: #D1D5DB;
    }

    .days-left {
      font-weight: 600;
    }
  }
}

.badge-wrap {
  flex-shrink: 0;

  .status-badge {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.5px;
    padding: 3px 8px;
    border-radius: $radius-pill;
    border: 1px solid transparent;
  }
}
</style>
