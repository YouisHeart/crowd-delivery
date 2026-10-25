<script setup>
import Icon from '../ui/Icon.vue'

defineProps({
  active: { type: String, default: 'home' },
})

const items = [
  { key: 'home', label: '工作台', to: '/home', icon: 'home' },
  { key: 'hall', label: '订单大厅', to: '/hall', icon: 'orders' },
  { key: 'route', label: '路线', to: '/route', icon: 'route' },
  { key: 'earnings', label: '收益', to: '/earnings', icon: 'wallet' },
  { key: 'profile', label: '我的', to: '/profile', icon: 'user' },
]
</script>

<template>
  <nav class="bottom-nav" aria-label="主导航">
    <RouterLink
      v-for="item in items"
      :key="item.key"
      :to="item.to"
      class="bottom-nav__item"
      :class="{ 'is-active': active === item.key }"
      :data-testid="`bottomnav-${item.key}`"
    >
      <span class="bottom-nav__icon"><Icon :name="item.icon" :size="22" /></span>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: relative;
  z-index: 25;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-around;
  min-height: 62px;
  padding: 5px 8px calc(5px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(15, 17, 20, 0.07);
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 -8px 22px rgba(20, 24, 28, 0.035);
  backdrop-filter: blur(14px);
}
.bottom-nav__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 2px 3px;
  border-radius: 12px;
  color: #9298a2;
  font-size: 10px;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.18s ease;
}
.bottom-nav__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 29px;
  border-radius: 10px;
  transition: background 0.18s ease, transform 0.18s ease;
}
.bottom-nav__item.is-active {
  color: #17191d;
}
.bottom-nav__item.is-active .bottom-nav__icon {
  background: var(--yellow);
  box-shadow: 0 4px 10px rgba(255, 208, 0, 0.28);
  transform: translateY(-1px);
}
.bottom-nav__item:active {
  transform: scale(0.97);
}
</style>
