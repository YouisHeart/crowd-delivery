<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  items: { type: Array, default: () => [] },
  scrollable: { type: Boolean, default: false },
  tone: { type: String, default: 'light' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="segmented" :class="[`segmented--${tone}`, { 'is-scrollable': scrollable }]" role="tablist">
    <button
      v-for="item in items"
      :key="item.key"
      class="segmented__item"
      :class="{ 'is-active': modelValue === item.key }"
      type="button"
      role="tab"
      :aria-selected="modelValue === item.key"
      @click="emit('update:modelValue', item.key)"
    >
      <span>{{ item.label }}</span>
      <span v-if="item.count !== undefined" class="segmented__count">{{ item.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px;
  border-radius: 12px;
  background: #f2f3f5;
}
.segmented.is-scrollable {
  overflow-x: auto;
  justify-content: flex-start;
  scrollbar-width: none;
}
.segmented.is-scrollable::-webkit-scrollbar {
  display: none;
}
.segmented__item {
  display: inline-flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 9px;
  border: 0;
  border-radius: 9px;
  color: #7c828d;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
}
.segmented.is-scrollable .segmented__item {
  flex: 0 0 auto;
  min-width: 74px;
}
.segmented__item.is-active {
  color: #17191d;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 17, 20, 0.08);
}
.segmented__count {
  display: inline-flex;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 8px;
  color: #17191d;
  background: var(--yellow);
  font-family: var(--font-numeric);
  font-size: 10px;
  line-height: 1;
}
.segmented--dark {
  background: rgba(255, 255, 255, 0.09);
}
.segmented--dark .segmented__item {
  color: rgba(255, 255, 255, 0.56);
}
.segmented--dark .segmented__item.is-active {
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: none;
}
</style>
