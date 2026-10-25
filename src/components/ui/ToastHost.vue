<script setup>
import { computed } from 'vue'
import { appState } from '../../stores/appStore'
import Icon from './Icon.vue'

const toast = computed(() => appState.toast)
</script>

<template>
  <div class="toast-host" aria-live="polite" aria-atomic="true">
    <Transition name="toast">
      <div v-if="toast" :key="toast.id" class="toast" :class="`toast--${toast.type}`">
        <span class="toast__icon">
          <Icon :name="toast.type === 'warning' ? 'alert' : 'check-circle'" :size="18" />
        </span>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-host {
  position: absolute;
  bottom: 94px;
  left: 50%;
  z-index: 80;
  width: max-content;
  max-width: calc(100% - 44px);
  transform: translateX(-50%);
  pointer-events: none;
}
.toast {
  display: flex;
  width: max-content;
  max-width: 100%;
  align-items: center;
  gap: 8px;
  padding: 11px 15px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: #fff;
  background: rgba(24, 27, 31, 0.94);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  backdrop-filter: blur(10px);
}
.toast--success .toast__icon {
  color: #b8f34a;
}
.toast--warning .toast__icon {
  color: #ffd100;
}
.toast__icon {
  display: inline-flex;
  flex: none;
}
.toast > span:last-child {
  min-width: 0;
  overflow-wrap: anywhere;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>


