import { defineStore } from 'pinia';

export interface PilotProfile {
  name: string;
  totalFlightHours: number;
  avatarUrl: string;
}

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const token = ref<string | null>(null);
  const pilot = ref<PilotProfile | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Initialize from client storage
  if (import.meta.client) {
    const savedToken = localStorage.getItem('susiair_token');
    const savedPilot = localStorage.getItem('susiair_pilot');
    if (savedToken) {
      token.value = savedToken;
    }
    if (savedPilot) {
      try {
        pilot.value = JSON.parse(savedPilot);
      } catch {
        pilot.value = null;
      }
    }
  }

  const isAuthenticated = computed(() => !!token.value);

  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ token: string; pilot: PilotProfile }>(`${apiBase}/auth/login`, {
        method: 'POST',
        body: { username, password },
      });

      token.value = response.token;
      pilot.value = response.pilot;

      if (import.meta.client) {
        localStorage.setItem('susiair_token', response.token);
        localStorage.setItem('susiair_pilot', JSON.stringify(response.pilot));
      }

      return true;
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Invalid username or password';
      error.value = Array.isArray(msg) ? msg.join(', ') : msg;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchProfile() {
    if (!token.value) return;

    try {
      const profile = await $fetch<PilotProfile>(`${apiBase}/pilot/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      pilot.value = profile;
      if (import.meta.client) {
        localStorage.setItem('susiair_pilot', JSON.stringify(profile));
      }
    } catch (err: any) {
      if (err?.status === 401) {
        logout();
      }
    }
  }

  function logout() {
    token.value = null;
    pilot.value = null;
    if (import.meta.client) {
      localStorage.removeItem('susiair_token');
      localStorage.removeItem('susiair_pilot');
    }
    navigateTo('/login');
  }

  return {
    token,
    pilot,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchProfile,
  };
});
