import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export interface DocumentItem {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'safe' | 'soon' | 'expired';
  badgeColor: string;
  statusLabel: string;
}

export interface DocumentsResponse {
  today: string;
  warningDaysThreshold: number;
  documents: DocumentItem[];
}

export const useDocumentsStore = defineStore('documents', () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const authStore = useAuthStore();

  const documents = ref<DocumentItem[]>([]);
  const warningDaysThreshold = ref(30);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDocuments() {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<DocumentsResponse>(`${apiBase}/documents`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
        },
      });
      documents.value = data.documents;
      warningDaysThreshold.value = data.warningDaysThreshold;
    } catch (err: any) {
      if (err?.status === 401) {
        authStore.logout();
      } else {
        error.value = err?.data?.message || err?.message || 'Failed to load documents';
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    documents,
    warningDaysThreshold,
    isLoading,
    error,
    fetchDocuments,
  };
});
