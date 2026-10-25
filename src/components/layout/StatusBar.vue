<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { nowClock } from '../../utils/format'

defineProps({
  theme: { type: String, default: 'light' },
})

const clock = ref(nowClock())
let timer

onMounted(() => {
  timer = window.setInterval(() => {
    clock.value = nowClock()
  }, 20000)
})

onBeforeUnmount(() => window.clearInterval(timer))
</script>

<template>
  
</template>

<style scoped>
.status-bar {
  position: relative;
  z-index: 30;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  padding: 0 18px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.status-dark {
  color: #ffffff;
  background: #111214;
}
.status-light {
  color: #1f2329;
  background: #ffffff;
}
.status-map {
  color: #1f2329;
  background: #eef1e9;
}
.status-bar__time {
  font-family: "DIN Alternate", "Bahnschrift", var(--font-sans);
  font-size: 13px;
}
.status-bar__right {
  display: flex;
  align-items: center;
  gap: 5px;
}
.status-bar__network {
  font-size: 10px;
  font-weight: 700;
}
.status-bar__battery {
  position: relative;
  display: inline-flex;
  width: 21px;
  height: 10px;
  padding: 1px;
  border: 1.2px solid currentColor;
  border-radius: 3px;
  opacity: 0.9;
}
.status-bar__battery::after {
  content: "";
  position: absolute;
  top: 2.5px;
  right: -3px;
  width: 1.5px;
  height: 4px;
  border-radius: 0 1px 1px 0;
  background: currentColor;
}
.status-bar__battery i {
  display: block;
  width: 72%;
  height: 100%;
  border-radius: 1px;
  background: currentColor;
}
</style>
