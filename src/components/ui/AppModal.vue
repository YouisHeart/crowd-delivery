<script setup>
import Icon from './Icon.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
  confirmTone: { type: String, default: 'primary' },
  showFooter: { type: Boolean, default: true },
  closeOnScrim: { type: Boolean, default: true },
  hideCancel: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-layer" role="dialog" aria-modal="true" :aria-label="title">
        <div class="modal-scrim" @click="closeOnScrim && close()" />
        <section class="modal-card">
          <button v-if="!hideCancel" class="modal-close" type="button" aria-label="关闭" @click="close">
            <Icon name="close" :size="18" />
          </button>
          <div v-if="title" class="modal-head">
            <h3>{{ title }}</h3>
            <p v-if="subtitle">{{ subtitle }}</p>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="showFooter" class="modal-footer">
            <button v-if="!hideCancel" class="btn btn--ghost" type="button" @click="close">
              {{ cancelText }}
            </button>
            <button
              class="btn"
              :class="`btn--${confirmTone}`"
              type="button"
              data-testid="modal-confirm"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.modal-scrim {
  position: absolute;
  inset: 0;
  background: rgba(10, 12, 15, 0.52);
  backdrop-filter: blur(2px);
}
.modal-card {
  position: relative;
  width: min(430px, 100vw);
  padding: 22px 20px calc(18px + env(safe-area-inset-bottom));
  border-radius: 24px 24px 0 0;
  background: #fff;
  box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.18);
}
.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #767c87;
  background: #f3f4f6;
  cursor: pointer;
}
.modal-head h3 {
  margin: 0;
  padding-right: 30px;
  color: #17191d;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.modal-head p {
  margin: 6px 0 0;
  color: #7d838d;
  font-size: 12px;
  line-height: 1.55;
}
.modal-body {
  margin-top: 16px;
}
.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 22px;
}
@media (min-width: 520px) {
  .modal-layer {
    align-items: center;
  }
  .modal-card {
    width: 382px;
    padding: 22px;
    border-radius: 20px;
  }
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.26s cubic-bezier(0.22, 1, 0.36, 1);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: translateY(100%);
}
@media (min-width: 520px) {
  .modal-enter-from .modal-card,
  .modal-leave-to .modal-card {
    transform: scale(0.94) translateY(8px);
  }
}
</style>
