<template>
  <div class="login-cockpit-page">
    <div class="ambient-glow-circle"></div>

    <div class="login-cockpit-card">
      <!-- Susi Air Brand & Portal Eyebrow -->
      <div class="brand-hero">
        <img src="/images/logo-white.png" alt="Susi Air Logo" class="login-brand-logo" />
        <div class="sub-badge-row">
          <span class="portal-tag mono">ELECTRONIC FLIGHT BAG</span>
          <span class="version-tag mono">EFB v1.0</span>
        </div>
      </div>

      <div class="portal-header">
        <h1 class="portal-title">Flight Crew Sign In</h1>
        <p class="portal-desc">Enter pilot credentials to initialize flight schedules, hours to limit, and duty roster.</p>
      </div>

      <!-- Error banner -->
      <div v-if="authStore.error" class="error-banner">
        <AlertTriangle :size="16" class="error-icon" />
        <span>{{ authStore.error }}</span>
      </div>

      <!-- Login Form -->
      <form class="cockpit-form" @submit.prevent="handleSubmit">
        <div class="form-field">
          <label for="username" class="mono">PILOT USERNAME</label>
          <div class="input-container">
            <User :size="17" class="field-icon" />
            <input
              id="username"
              v-model="username"
              type="text"
              class="mono"
              placeholder="e.g. johndoe"
              autocomplete="username"
              required
            />
          </div>
        </div>

        <div class="form-field">
          <label for="password" class="mono">AUTHORIZATION KEY</label>
          <div class="input-container">
            <Lock :size="17" class="field-icon" />
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
              class="password-visibility-btn"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="cockpit-submit-btn"
          :disabled="authStore.isLoading"
        >
          <span v-if="authStore.isLoading" class="cockpit-spinner"></span>
          <span v-else class="btn-text">
            <span>Initialize Cockpit Session</span>
            <ArrowRight :size="16" />
          </span>
        </button>
      </form>

      <!-- Evaluator Quick-Fill Box -->
      <div class="eval-account-box">
        <div class="eval-header">
          <Key :size="13" />
          <span class="mono">EVALUATION DEMO ACCOUNT</span>
        </div>
        <p class="eval-credentials mono">
          USER: <strong>johndoe</strong> | PASS: <strong>susiairtest</strong>
        </p>
        <button type="button" class="quick-fill-btn mono font-bold" @click="fillDemo">
          ⚡ One-Click Auto Fill
        </button>
      </div>

      <div class="login-legal-footer">
        <span class="mono">PT ASI PUDJIASTUTI AVIATION · DGCA AOC 135</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { User, Lock, Eye, EyeOff, AlertTriangle, ArrowRight, Key } from 'lucide-vue-next';

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
.login-cockpit-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  background: radial-gradient(circle at 50% 10%, #152C4A 0%, #071321 80%, #040A12 100%);
  position: relative;
  overflow: hidden;
}

.ambient-glow-circle {
  position: absolute;
  top: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.login-cockpit-card {
  width: 100%;
  max-width: 400px;
  background: rgba(14, 33, 56, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 26px;
  padding: 32px 26px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

.brand-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;

  .login-brand-logo {
    height: 42px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
  }

  .sub-badge-row {
    display: flex;
    gap: 6px;

    .portal-tag {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #38BDF8;
      background: rgba(14, 165, 233, 0.12);
      border: 1px solid rgba(14, 165, 233, 0.3);
      padding: 2px 8px;
      border-radius: $radius-pill;
    }

    .version-tag {
      font-size: 8.5px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: $radius-pill;
    }
  }
}

.portal-header {
  text-align: center;
  margin-bottom: 22px;

  .portal-title {
    font-size: 20px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.4px;
  }

  .portal-desc {
    font-size: 11.5px;
    color: #94A3B8;
    margin-top: 4px;
    line-height: 1.4;
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(230, 55, 87, 0.15);
  border: 1px solid rgba(230, 55, 87, 0.4);
  color: #FFA5B4;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 600;
  margin-bottom: 18px;

  .error-icon {
    color: $color-brand-red;
    flex-shrink: 0;
  }
}

.cockpit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 9.5px;
    font-weight: 800;
    letter-spacing: 0.8px;
    color: #94A3B8;
  }
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;

  .field-icon {
    position: absolute;
    left: 12px;
    color: #64748B;
  }

  input {
    width: 100%;
    padding: 12px 42px 12px 38px;
    font-size: 13px;
    font-family: inherit;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 12px;
    background: rgba(7, 19, 33, 0.6);
    color: white;
    transition: $transition-default;

    &::placeholder {
      color: #64748B;
    }

    &:focus {
      outline: none;
      border-color: #38BDF8;
      background: rgba(7, 19, 33, 0.9);
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
    }
  }

  .password-visibility-btn {
    position: absolute;
    right: 12px;
    color: #64748B;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: white;
    }
  }
}

.cockpit-submit-btn {
  margin-top: 6px;
  padding: 13px;
  background: linear-gradient(135deg, #E63757 0%, #C72543 100%);
  color: white;
  font-weight: 800;
  font-size: 13.5px;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(230, 55, 87, 0.4);
  letter-spacing: 0.3px;

  &:hover {
    background: linear-gradient(135deg, #F04363 0%, #D42848 100%);
    box-shadow: 0 6px 20px rgba(230, 55, 87, 0.5);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-text {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cockpit-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.eval-account-box {
  margin-top: 20px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  text-align: center;

  .eval-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 9.5px;
    font-weight: 800;
    color: #FBBF24;
    letter-spacing: 0.8px;
  }

  .eval-credentials {
    font-size: 10.5px;
    color: #CBD5E1;
    margin: 5px 0 8px;

    strong {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      padding: 1px 5px;
      border-radius: 3px;
    }
  }

  .quick-fill-btn {
    font-size: 10.5px;
    color: #38BDF8;
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.3);
    padding: 4px 12px;
    border-radius: $radius-pill;

    &:hover {
      background: rgba(56, 189, 248, 0.25);
      color: white;
    }
  }
}

.login-legal-footer {
  margin-top: 22px;
  text-align: center;
  font-size: 9px;
  color: #64748B;
  letter-spacing: 0.5px;
}
</style>
