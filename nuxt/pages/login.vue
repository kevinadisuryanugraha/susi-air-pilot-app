<template>
  <div class="login-wrapper">
    <!-- Sky gradient background with aviation grid overlay -->
    <div class="bg-layer"></div>
    <div class="bg-grid"></div>

    <!-- Decorative aviation rings -->
    <div class="deco-ring ring-1"></div>
    <div class="deco-ring ring-2"></div>

    <!-- Login Card -->
    <div class="login-card anim-fade-up">
      <!-- Logo area -->
      <div class="logo-area">
        <div class="logo-wrap">
          <img src="/images/logo.png" alt="Susi Air" class="susi-logo" />
        </div>
        <span class="ops-tag">PILOT OPERATIONS</span>
      </div>

      <div class="welcome-text">
        <h1 class="title">Welcome Back</h1>
        <p class="subtitle">Sign in with your pilot credentials</p>
      </div>

      <!-- Error alert -->
      <div v-if="authStore.error" class="alert-box anim-fade-in">
        <AlertCircle :size="15" />
        <span>{{ authStore.error }}</span>
      </div>

      <!-- Login form -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <label for="username">Username</label>
          <div class="input-field" :class="{ focused: focusedField === 'username' }">
            <User :size="17" class="field-icon" />
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Your pilot username"
              autocomplete="username"
              required
              @focus="focusedField = 'username'"
              @blur="focusedField = null"
            />
          </div>
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-field" :class="{ focused: focusedField === 'password' }">
            <Lock :size="17" class="field-icon" />
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Your password"
              autocomplete="current-password"
              required
              @focus="focusedField = 'password'"
              @blur="focusedField = null"
            />
            <button type="button" class="toggle-eye" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </div>

        <button
          id="btn-sign-in"
          type="submit"
          class="btn-primary"
          :disabled="authStore.isLoading"
        >
          <div v-if="authStore.isLoading" class="btn-spinner"></div>
          <span v-else>
            <span>Sign In</span>
            <span class="btn-arrow">→</span>
          </span>
        </button>
      </form>

      <!-- Demo credentials -->
      <div class="demo-box">
        <div class="demo-header">
          <div class="demo-icon">🔑</div>
          <span class="demo-title">Evaluation Account</span>
        </div>
        <p class="demo-creds">
          <span><strong>johndoe</strong> / <strong>susiairtest</strong></span>
        </p>
        <button type="button" class="btn-quick-fill" @click="fillDemo">
          Tap to fill credentials
        </button>
      </div>

      <footer class="login-footer">
        <span>© PT ASI Pudjiastuti Aviation · 2026</span>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-vue-next';

definePageMeta({ layout: false });

const authStore = useAuthStore();
const username = ref('johndoe');
const password = ref('susiairtest');
const showPassword = ref(false);
const focusedField = ref<string | null>(null);

async function handleSubmit() {
  const success = await authStore.login(username.value, password.value);
  if (success) navigateTo('/');
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
  position: relative;
  overflow: hidden;
}

// Background layers
.bg-layer {
  position: fixed;
  inset: 0;
  background: linear-gradient(145deg, #C4E3F5 0%, #D8EFF9 25%, #EAF5FC 55%, #F2F8FD 100%);
  z-index: 0;
}

.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(14, 33, 56, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 33, 56, 0.045) 1px, transparent 1px);
  background-size: 40px 40px;
  z-index: 0;
}

// Decorative aviation compass/ring shapes
.deco-ring {
  position: fixed;
  border-radius: 50%;
  border: 1px solid rgba(34, 197, 232, 0.2);
  z-index: 0;
  pointer-events: none;
}

.ring-1 {
  width: 500px;
  height: 500px;
  top: -200px;
  right: -150px;
}

.ring-2 {
  width: 350px;
  height: 350px;
  bottom: -120px;
  left: -100px;
  border-color: rgba(14, 33, 56, 0.08);
}

// ---- Login Card ----
.login-card {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 32px 26px 28px;
  box-shadow: 0 24px 60px rgba(14, 33, 56, 0.15), 0 4px 16px rgba(14, 33, 56, 0.08);
  position: relative;
  z-index: 1;
}

// ---- Logo ----
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.logo-wrap {
  padding: 12px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: $shadow-card;
  border: 1px solid $color-border;
  display: flex;
  align-items: center;
  justify-content: center;
}

.susi-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.ops-tag {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: $color-chart-accent;
  background: rgba(34, 197, 232, 0.1);
  border: 1px solid rgba(34, 197, 232, 0.25);
  padding: 3px 10px;
  border-radius: $radius-pill;
}

// ---- Welcome ----
.welcome-text {
  text-align: center;
  margin-bottom: 24px;

  .title {
    font-size: 22px;
    font-weight: 800;
    color: $color-primary-navy;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .subtitle {
    font-size: 13px;
    color: $color-text-muted;
    font-weight: 500;
  }
}

// ---- Alert ----
.alert-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(230, 55, 87, 0.08);
  border: 1px solid rgba(230, 55, 87, 0.25);
  color: $color-brand-red;
  padding: 10px 13px;
  border-radius: $radius-sm;
  font-size: 12.5px;
  font-weight: 600;
  margin-bottom: 16px;
}

// ---- Form ----
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 7px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: $color-text-secondary;
    letter-spacing: 0.2px;
  }
}

.input-field {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1.5px solid $color-border;
  border-radius: $radius-sm;
  transition: $transition-smooth;

  &.focused {
    border-color: $color-chart-accent;
    box-shadow: 0 0 0 3px rgba(34, 197, 232, 0.12);
  }

  .field-icon {
    position: absolute;
    left: 13px;
    color: $color-text-muted;
    pointer-events: none;
    transition: color 0.2s ease;
  }

  &.focused .field-icon {
    color: $color-chart-accent;
  }

  input {
    width: 100%;
    padding: 13px 42px 13px 40px;
    font-size: 14px;
    font-family: inherit;
    border: none;
    background: transparent;
    color: $color-text-primary;
    font-weight: 500;

    &::placeholder {
      color: $color-text-muted;
      font-weight: 400;
    }

    &:focus {
      outline: none;
    }
  }

  .toggle-eye {
    position: absolute;
    right: 12px;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    transition: $transition-smooth;

    &:hover {
      color: $color-primary-navy;
      background: $color-bg;
    }
  }
}

// ---- Primary Button ----
.btn-primary {
  margin-top: 4px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, $color-brand-red 0%, #CC2F4A 100%);
  color: white;
  font-size: 14.5px;
  font-weight: 800;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(230, 55, 87, 0.35);
  transition: $transition-smooth;
  letter-spacing: 0.2px;

  span {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-arrow {
    font-size: 17px;
    transition: transform 0.2s ease;
  }

  &:hover:not(:disabled) {
    box-shadow: 0 6px 24px rgba(230, 55, 87, 0.45);
    transform: translateY(-1px);

    .btn-arrow {
      transform: translateX(3px);
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ---- Demo Box ----
.demo-box {
  margin-top: 20px;
  padding: 14px 16px;
  background: rgba(14, 33, 56, 0.03);
  border: 1px solid rgba(14, 33, 56, 0.08);
  border-radius: $radius-card;
  text-align: center;

  .demo-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 6px;

    .demo-icon { font-size: 15px; }

    .demo-title {
      font-size: 11.5px;
      font-weight: 700;
      color: $color-text-primary;
    }
  }

  .demo-creds {
    font-size: 12px;
    color: $color-text-muted;
    margin-bottom: 10px;

    strong {
      color: $color-primary-navy;
      font-weight: 700;
    }
  }

  .btn-quick-fill {
    font-size: 11.5px;
    font-weight: 700;
    color: $color-chart-accent;
    border: 1px solid rgba(34, 197, 232, 0.3);
    background: rgba(34, 197, 232, 0.08);
    padding: 6px 14px;
    border-radius: $radius-pill;
    transition: $transition-smooth;

    &:hover {
      background: rgba(34, 197, 232, 0.15);
    }
  }
}

// ---- Footer ----
.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 10.5px;
  color: $color-text-muted;
  font-weight: 500;
}
</style>
