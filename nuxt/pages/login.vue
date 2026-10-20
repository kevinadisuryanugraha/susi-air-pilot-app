<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo-wrapper">
        <img src="/images/logo.png" alt="Susi Air Logo" class="login-logo" />
        <span class="sub-brand">PILOT OPERATIONS PORTAL</span>
      </div>

      <div class="form-header">
        <h1 class="login-title">Sign In</h1>
        <p class="login-desc">Enter your pilot credentials to access flight schedules and duty limits.</p>
      </div>

      <!-- Error alert -->
      <div v-if="authStore.error" class="error-banner">
        <AlertCircle :size="18" />
        <span>{{ authStore.error }}</span>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrap">
            <User :size="18" class="input-icon" />
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="e.g. johndoe"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrap">
            <Lock :size="18" class="input-icon" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="eye-btn"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="spinner"></span>
          <span v-else>Sign In to Cockpit</span>
        </button>
      </form>

      <!-- Demo credentials helper -->
      <div class="demo-credentials-box">
        <div class="demo-header">
          <Info :size="14" />
          <span>Evaluation Account</span>
        </div>
        <p class="demo-text">Username: <code>johndoe</code> | Password: <code>susiairtest</code></p>
        <button type="button" class="fill-demo-btn" @click="fillDemo">
          Quick Fill Credentials
        </button>
      </div>

      <div class="login-footer">
        <span>PT ASI Pudjiastuti Aviation · Safety First</span>
      </div>
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
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(180deg, #091727 0%, $color-primary-navy 100%);
}

.login-card {
  width: 100%;
  max-width: 390px;
  background: white;
  border-radius: 20px;
  padding: 28px 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
}

.logo-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;

  .login-logo {
    height: 38px;
    width: auto;
    object-fit: contain;
  }

  .sub-brand {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
    color: $color-brand-red;
    background: rgba(230, 55, 87, 0.1);
    padding: 2px 10px;
    border-radius: $radius-pill;
  }
}

.form-header {
  text-align: center;
  margin-bottom: 20px;

  .login-title {
    font-size: 22px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.5px;
  }

  .login-desc {
    font-size: 12px;
    color: $color-text-secondary;
    margin-top: 4px;
    line-height: 1.4;
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: $color-brand-red;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: $color-primary-navy;
  }
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;

  .input-icon {
    position: absolute;
    left: 12px;
    color: $color-text-muted;
  }

  input {
    width: 100%;
    padding: 11px 40px 11px 38px;
    font-size: 13px;
    font-family: inherit;
    border: 1px solid $color-border;
    border-radius: 10px;
    background: #FAFAFA;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: $color-primary-navy;
      background: white;
      box-shadow: 0 0 0 3px rgba(14, 33, 56, 0.1);
    }
  }

  .eye-btn {
    position: absolute;
    right: 12px;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $color-primary-navy;
    }
  }
}

.submit-btn {
  margin-top: 6px;
  padding: 13px;
  background: $color-brand-red;
  color: white;
  font-weight: 700;
  font-size: 14px;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(230, 55, 87, 0.3);

  &:hover {
    background: #D42646;
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

.demo-credentials-box {
  margin-top: 18px;
  padding: 12px;
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 10px;
  text-align: center;

  .demo-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 700;
    color: $color-primary-navy;
  }

  .demo-text {
    font-size: 11px;
    color: $color-text-secondary;
    margin: 4px 0 8px;

    code {
      background: #E2E8F0;
      padding: 1px 4px;
      border-radius: 4px;
      font-weight: 600;
    }
  }

  .fill-demo-btn {
    font-size: 11px;
    font-weight: 700;
    color: $color-primary-navy;
    text-decoration: underline;

    &:hover {
      color: $color-brand-red;
    }
  }
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 10px;
  color: $color-text-muted;
}
</style>
