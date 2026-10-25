<script setup>
import { useRouter } from 'vue-router'
import Icon from '../ui/Icon.vue'

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  back: { type: [Boolean, String], default: false },
  theme: { type: String, default: 'light' },
  border: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false },
})

const router = useRouter()

function goBack() {
  if (typeof props.back === 'string') {
    router.push(props.back)
    return
  }
  if (window.history.length > 1) router.back()
  else router.push('/home')
}
</script>

<template>
  <header
    class="app-header"
    :class="[`app-header--${theme}`, { 'has-border': border, 'is-sticky': sticky }]"
  >
    <div class="app-header__row">
      <button v-if="back" class="icon-button app-header__back" type="button" aria-label="返回" @click="goBack">
        <Icon name="chevron-left" :size="24" />
      </button>
      <div class="app-header__titles">
        <h1 v-if="title">{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="app-header__right">
        <slot name="right" />
      </div>
    </div>
    <slot />
  </header>
</template>

<style scoped>
.app-header {
  position: relative;
  z-index: 10;
  flex: none;
  padding: 8px 16px 10px;
}
.app-header.is-sticky {
  position: sticky;
  top: 0;
}
.app-header--light {
  color: var(--ink);
  background: #fff;
}
.app-header--dark {
  color: #fff;
  background: #111214;
}
.app-header--transparent {
  color: var(--ink);
  background: transparent;
}
.app-header.has-border {
  border-bottom: 1px solid var(--line);
}
.app-header__row {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
}
.app-header__back {
  margin-left: -8px;
}
.app-header__titles {
  min-width: 0;
  flex: 1;
}
.app-header__titles h1 {
  margin: 0;
  color: inherit;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.2px;
}
.app-header__titles p {
  margin: 3px 0 0;
  color: var(--muted);
  font-size: 12px;
}
.app-header--dark .app-header__titles p {
  color: rgba(255, 255, 255, 0.58);
}
.app-header__right {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}
</style>
