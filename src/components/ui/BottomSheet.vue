<script setup>
import Icon from './Icon.vue'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  showHeader: { type: Boolean, default: true },
  closeOnScrim: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="modelValue" class="sheet-layer" role="dialog" aria-modal="true" :aria-label="title">
        <div class="sheet-scrim" @click="closeOnScrim && close()" />
        <section class="sheet-panel">
          <div class="sheet-grabber" />
          <header v-if="showHeader" class="sheet-head">
            <div>
              <h3 v-if="title">{{ title }}</h3>
              <p v-if="subtitle">{{ subtitle }}</p>
            </div>
            <button class="sheet-close" type="button" aria-label="关闭" @click="close">
              <Icon name="close" :size="18" />
            </button>
          </header>
          <div class="sheet-body">
            <slot />
          </div>
          <footer v-if="$slots.footer" class="sheet-footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-layer {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.sheet-scrim {
  position: absolute;
  inset: 0;
  background: rgba(10, 12, 15, 0.48);
  backdrop-filter: blur(2px);
}
.sheet-panel {
  position: relative;
  display: flex;
  width: min(430px, 100vw);
  max-height: min(83vh, 760px);
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px 24px 0 0;
  background: #fff;
  box-shadow: 0 -18px 50px rgba(0, 0, 0, 0.16);
}
.sheet-grabber {
  width: 34px;
  height: 4px;
  flex: none;
  margin: 8px auto 3px;
  border-radius: 2px;
  background: #e4e6e9;
}
.sheet-head {
  display: flex;
  flex: none;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 20px 12px;
}
.sheet-head h3 {
  margin: 0;
  color: #17191d;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.3px;
}
.sheet-head p {
  margin: 5px 0 0;
  color: #858b95;
  font-size: 12px;
  line-height: 1.5;
}
.sheet-close {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #6f7580;
  background: #f3f4f6;
  cursor: pointer;
}
.sheet-body {
  overflow-y: auto;
  padding: 4px 20px 20px;
  overscroll-behavior: contain;
}
.sheet-footer {
  display: flex;
  flex: none;
  gap: 10px;
  padding: 12px 20px calc(16px + env(safe-area-inset-bottom));
  border-top: 1px solid #f0f1f3;
  background: #fff;
}
@media (min-width: 520px) {
  .sheet-layer {
    bottom: max(20px, calc((100dvh - 920px) / 2));
  }
  .sheet-panel {
    border-radius: 24px;
  }
}
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.22s ease;
}
.sheet-enter-active .sheet-panel,
.sheet-leave-active .sheet-panel {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet-panel,
.sheet-leave-to .sheet-panel {
  transform: translateY(100%);
}
</style>
