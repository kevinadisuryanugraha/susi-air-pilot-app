<template>
  <div class="logbook-page">
    <HeaderBar />

    <div class="logbook-content">
      <!-- Section Header & Add Button -->
      <div class="logbook-title-row">
        <div>
          <h2 class="page-title">Electronic Logbook</h2>
          <p class="page-subtitle">Pilot flight legs & block hours ledger</p>
        </div>

        <button class="btn-new-log" @click="showModal = true">
          <Plus :size="16" />
          <span>Record Leg</span>
        </button>
      </div>

      <!-- Stats Summary Row -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-lbl">LOGGED FLIGHTS</span>
          <span class="stat-val mono tabular font-bold">{{ store.stats.totalFlights }}</span>
        </div>

        <div class="stat-card">
          <span class="stat-lbl">BLOCK HOURS</span>
          <span class="stat-val mono tabular font-bold text-navy">{{ store.stats.totalHours }}h</span>
        </div>

        <div class="stat-card">
          <span class="stat-lbl">LANDINGS</span>
          <span class="stat-val mono tabular font-bold text-success">{{ store.stats.totalLandings }}</span>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="store.isLoading && store.entries.length === 0" class="loading-state">
        <div class="spinner"></div>
        <span>Retrieving flight logbook...</span>
      </div>

      <!-- Logbook Entries List -->
      <div v-else class="entries-list">
        <div
          v-for="entry in store.entries"
          :key="entry.id"
          class="leg-card"
        >
          <div class="leg-top-row">
            <div class="flight-tag-group">
              <span class="flight-no mono font-bold">{{ entry.flightNumber }}</span>
              <span class="leg-date tabular">{{ entry.date }}</span>
            </div>

            <span class="role-badge mono">{{ entry.pilotRole }}</span>
          </div>

          <div class="leg-route-row">
            <div class="route-display mono">
              <span class="iata-code">{{ entry.origin }}</span>
              <ArrowRight :size="15" class="arrow-icon" />
              <span class="iata-code">{{ entry.destination }}</span>
            </div>

            <div class="flight-duration mono font-bold">
              {{ entry.flightHours }}h
            </div>
          </div>

          <div class="leg-meta-row">
            <span class="aircraft-tail mono">{{ entry.aircraft }}</span>
            <div class="block-times tabular">
              <span>{{ entry.offBlock }}</span>
              <span class="dash">-</span>
              <span>{{ entry.onBlock }}</span>
              <span class="dot">•</span>
              <span>{{ entry.landings }} Ldg</span>
            </div>
          </div>

          <div v-if="entry.remarks" class="leg-remarks">
            <span>{{ entry.remarks }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Record New Flight Leg -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-form-card" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Record Flight Leg</h3>
          <p class="modal-desc">Enter off-block and on-block times for verification</p>
        </div>

        <form class="leg-form" @submit.prevent="handleCreateLog">
          <div class="form-row two-col">
            <div class="form-group">
              <label>Date</label>
              <input v-model="form.date" type="date" required />
            </div>

            <div class="form-group">
              <label>Flight No.</label>
              <input v-model="form.flightNumber" type="text" placeholder="e.g. SI-203" required />
            </div>
          </div>

          <div class="form-group">
            <label>Aircraft Fleet</label>
            <select v-model="form.aircraft" required>
              <option value="PK-VVP (C208B)">PK-VVP · Cessna 208B Caravan</option>
              <option value="PK-VVF (C208B)">PK-VVF · Cessna 208B Caravan</option>
              <option value="PK-VVN (Piaggio P180)">PK-VVN · Piaggio P180 Avanti II</option>
              <option value="PK-VVS (PC-6)">PK-VVS · Pilatus PC-6 Porter</option>
            </select>
          </div>

          <div class="form-row two-col">
            <div class="form-group">
              <label>Origin IATA</label>
              <input v-model="form.origin" type="text" placeholder="e.g. CJN" maxlength="4" required />
            </div>

            <div class="form-group">
              <label>Destination IATA</label>
              <input v-model="form.destination" type="text" placeholder="e.g. HLP" maxlength="4" required />
            </div>
          </div>

          <div class="form-row two-col">
            <div class="form-group">
              <label>Off-Block (Departure)</label>
              <input v-model="form.offBlock" type="time" required @change="calculateHoursFromTimes" />
            </div>

            <div class="form-group">
              <label>On-Block (Arrival)</label>
              <input v-model="form.onBlock" type="time" required @change="calculateHoursFromTimes" />
            </div>
          </div>

          <div class="form-row two-col">
            <div class="form-group">
              <label>Flight Hours</label>
              <input v-model.number="form.flightHours" type="number" step="0.05" min="0.1" required />
            </div>

            <div class="form-group">
              <label>Landings</label>
              <input v-model.number="form.landings" type="number" min="1" max="10" required />
            </div>
          </div>

          <div class="form-group">
            <label>Operational Remarks (Optional)</label>
            <input v-model="form.remarks" type="text" placeholder="e.g. VFR visual approach, clear" />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="showModal = false">
              Cancel
            </button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="spinner"></span>
              <span v-else>Save to Pilot Logbook</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { useLogbookStore, type CreateLogbookPayload } from '~/stores/logbook';
import { Plus, ArrowRight } from 'lucide-vue-next';

const store = useLogbookStore();
const showModal = ref(false);
const isSubmitting = ref(false);

const form = ref<CreateLogbookPayload>({
  date: '2026-05-15',
  flightNumber: 'SI-204',
  aircraft: 'PK-VVP (C208B)',
  origin: 'CJN',
  destination: 'HLP',
  offBlock: '14:00',
  onBlock: '15:15',
  flightHours: 1.25,
  landings: 1,
  pilotRole: 'PIC',
  remarks: '',
});

onMounted(() => {
  store.fetchLogbooks();
});

function calculateHoursFromTimes() {
  if (!form.value.offBlock || !form.value.onBlock) return;
  const [h1, m1] = form.value.offBlock.split(':').map(Number);
  const [h2, m2] = form.value.onBlock.split(':').map(Number);
  let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (mins < 0) mins += 24 * 60;
  form.value.flightHours = Number((mins / 60).toFixed(2));
}

async function handleCreateLog() {
  isSubmitting.value = true;
  const ok = await store.createEntry(form.value);
  isSubmitting.value = false;
  if (ok) {
    showModal.value = false;
    // reset flight number suggestion
    form.value.flightNumber = `SI-${Math.floor(200 + Math.random() * 50)}`;
  } else if (store.error) {
    alert(store.error);
  }
}
</script>

<style scoped lang="scss">
.logbook-page {
  display: flex;
  flex-direction: column;
}

.logbook-content {
  padding: 16px 20px 24px;
}

.logbook-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  .page-title {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.3px;
  }

  .page-subtitle {
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 1px;
  }
}

.btn-new-log {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: $color-brand-red;
  color: white;
  font-size: 11.5px;
  font-weight: 700;
  padding: 7px 14px;
  border-radius: $radius-pill;
  box-shadow: 0 2px 8px rgba(230, 55, 87, 0.25);

  &:hover {
    background-color: #D42646;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 18px;

  .stat-card {
    background-color: white;
    border: 1px solid $color-border;
    border-radius: $radius-card;
    padding: 10px 8px;
    text-align: center;
    box-shadow: $shadow-card;

    .stat-lbl {
      display: block;
      font-size: 8.5px;
      font-weight: 700;
      color: $color-text-secondary;
      letter-spacing: 0.5px;
    }

    .stat-val {
      font-size: 16px;
      margin-top: 2px;
      color: $color-primary-navy;
    }

    .text-navy { color: $color-primary-navy; }
    .text-success { color: $color-success; }
  }
}

.loading-state {
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: $color-text-secondary;

  .spinner {
    width: 22px;
    height: 22px;
    border: 2px solid #E2E8F0;
    border-top-color: $color-primary-navy;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.leg-card {
  background-color: white;
  border-radius: $radius-card;
  padding: 12px 14px;
  border: 1px solid $color-border;
  box-shadow: $shadow-card;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: $transition-default;

  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-sm;
  }
}

.leg-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .flight-tag-group {
    display: flex;
    align-items: center;
    gap: 8px;

    .flight-no {
      font-size: 12.5px;
      color: $color-primary-navy;
    }

    .leg-date {
      font-size: 11px;
      color: $color-text-secondary;
    }
  }

  .role-badge {
    font-size: 9px;
    font-weight: 800;
    color: #0284C7;
    background-color: #E0F2FE;
    padding: 2px 6px;
    border-radius: 4px;
  }
}

.leg-route-row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .route-display {
    display: flex;
    align-items: center;
    gap: 6px;

    .iata-code {
      font-size: 16px;
      font-weight: 800;
      color: $color-primary-navy;
    }

    .arrow-icon {
      color: $color-brand-red;
    }
  }

  .flight-duration {
    font-size: 15px;
    color: $color-primary-navy;
  }
}

.leg-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: $color-text-secondary;
  border-top: 1px dashed #E2E8F0;
  padding-top: 6px;
  margin-top: 2px;

  .aircraft-tail {
    font-weight: 600;
    color: #475569;
  }

  .block-times {
    display: flex;
    align-items: center;
    gap: 4px;

    .dot {
      color: #CBD5E1;
    }
  }
}

.leg-remarks {
  font-size: 10.5px;
  color: #64748B;
  font-style: italic;
  background-color: #F8FAFC;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 2px;
}

// Modal
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(14, 33, 56, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}

.modal-form-card {
  width: 100%;
  max-width: 440px;
  background-color: white;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding: 20px 20px 28px;
  animation: slideUp 0.2s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  margin-bottom: 16px;

  .modal-title {
    font-size: 18px;
    font-weight: 800;
    color: $color-primary-navy;
  }

  .modal-desc {
    font-size: 11.5px;
    color: $color-text-secondary;
    margin-top: 2px;
  }
}

.leg-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;

  label {
    font-size: 11px;
    font-weight: 700;
    color: $color-text-primary;
  }

  input, select {
    padding: 9px 12px;
    font-size: 13px;
    font-family: inherit;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background-color: #F8FAFC;
    color: $color-text-primary;

    &:focus {
      outline: none;
      border-color: $color-primary-navy;
      background-color: white;
    }
  }
}

.form-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;

  .btn-cancel {
    flex: 1;
    padding: 11px;
    background-color: #F1F5F9;
    color: #475569;
    font-weight: 700;
    border-radius: $radius-pill;
    font-size: 13px;

    &:hover {
      background-color: #E2E8F0;
    }
  }

  .btn-submit {
    flex: 2;
    padding: 11px;
    background-color: $color-brand-red;
    color: white;
    font-weight: 700;
    border-radius: $radius-pill;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: #D42646;
    }

    &:disabled {
      opacity: 0.7;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  }
}
</style>
