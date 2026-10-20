<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="logo-area">
        <img src="/images/logo.png" alt="Susi Air" class="susi-logo" />
        <span class="ops-tag">PILOT OPERATIONS</span>
      </div>

      <div class="welcome-text">
        <h1 class="title">Sign In</h1>
        <p class="subtitle">Enter your pilot credentials to continue</p>
      </div>

      <!-- Error alert -->
      <div v-if="authStore.error" class="alert-box">
        <AlertCircle :size="16" />
        <span>{{ authStore.error }}</span>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <label for="username">Username</label>
          <div class="input-field">
            <User :size="18" class="icon" />
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Username"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-field">
            <Lock :size="18" class="icon" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="toggle-eye"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn-primary"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="spinner"></span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <!-- Demo Account Box -->
      <div class="demo-box">
        <div class="demo-title">
          <Info :size="14" />
          <span>Evaluation Account</span>
        </div>
        <p class="demo-info">Username: <strong>johndoe</strong> | Password: <strong>susiairtest</strong></p>
        <button type="button" class="btn-quick-fill" @click="fillDemo">
          Quick Fill
        </button>
      </div>

      <footer class="login-footer">
        <span>PT ASI Pudjiastuti Aviation</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { User, Lock, Eye, EyeOff, AlertCircle, Info } from 'lucide-vue-next';

definePageMeta({
  layout: false,
});

const authStore = useAuthStore();
const username = ref('johndoe');
const password = ref('susiairtest');
const showPassword = ref(false);

async function handleSubmit() {
  const success = await authStore.login(username.value, password.value);
  if (success) {
    navigateTo('/');
  }
}

function fillDemo() {
  username.value = 'johndoe';
  password.value = 'susiairtest';
}
</script>

<style scoped lang="scss">
.login-wrapper {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  background-color: $color-primary-navy;
}

.login-card {
  width: 100%;
  max-width: 380px;
  background-color: $color-card-surface;
  border-radius: $radius-card;
  padding: 32px 24px;
  box-shadow: $shadow-floating;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;

  .susi-logo {
    height: 38px;
    width: auto;
    object-fit: contain;
  }

  .ops-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1px;
    color: $color-primary-navy;
    background-color: #EEF2F6;
    padding: 3px 8px;
    border-radius: $radius-pill;
  }
}

.welcome-text {
  text-align: center;
  margin-bottom: 22px;

  .title {
    font-size: 20px;
    font-weight: 800;
    color: $color-primary-navy;
  }

  .subtitle {
    font-size: 12px;
    color: $color-text-secondary;
    margin-top: 3px;
  }
}

.alert-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #FEF2F2;
  border: 1px solid #FEE2E2;
  color: $color-brand-red;
  padding: 10px 12px;
  border-radius: $radius-sm;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: $color-text-primary;
  }
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;

  .icon {
    position: absolute;
    left: 12px;
    color: $color-text-muted;
  }

  input {
    width: 100%;
    padding: 11px 40px 11px 38px;
    font-size: 13.5px;
    font-family: inherit;
    border: 1px solid $color-border;
    border-radius: $radius-sm;
    background-color: #F8FAFC;
    color: $color-text-primary;
    transition: $transition-default;

    &:focus {
      outline: none;
      border-color: $color-primary-navy;
      background-color: white;
    }
  }

  .toggle-eye {
    position: absolute;
    right: 12px;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $color-text-primary;
    }
  }
}

.btn-primary {
  margin-top: 6px;
  width: 100%;
  padding: 12px;
  background-color: $color-brand-red;
  color: white;
  font-size: 14px;
  font-weight: 700;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #D42646;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.demo-box {
  margin-top: 18px;
  padding: 12px;
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: $radius-sm;
  text-align: center;

  .demo-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: $color-primary-navy;
  }

  .demo-info {
    font-size: 11px;
    color: $color-text-secondary;
    margin: 4px 0 8px;

    strong {
      color: $color-primary-navy;
    }
  }

  .btn-quick-fill {
    font-size: 11px;
    font-weight: 700;
    color: #0284C7;
    text-decoration: underline;

    &:hover {
      color: $color-primary-navy;
    }
  }
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 11px;
  color: $color-text-muted;
}
</style>
