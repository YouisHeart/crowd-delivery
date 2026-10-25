<script setup>
import Icon from './Icon.vue'

defineProps({
  icon: { type: String, default: 'settings' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  value: { type: String, default: '' },
  danger: { type: Boolean, default: false },
  chevron: { type: Boolean, default: true },
  iconTone: { type: String, default: 'grey' },
})

defineEmits(['click'])
</script>

<template>
  <button
    class="settings-row"
    :class="{ 'is-danger': danger }"
    type="button"
    @click="$emit('click')"
  >
    <span class="settings-row__icon" :class="`tone-${iconTone}`"><Icon :name="icon" :size="18" /></span>
    <span class="settings-row__copy">
      <b>{{ title }}</b>
      <span v-if="description">{{ description }}</span>
    </span>
    <span v-if="value" class="settings-row__value">{{ value }}</span>
    <slot name="right" />
    <Icon v-if="chevron" name="chevron-right" :size="16" class="settings-row__chevron" />
  </button>
</template>

<style scoped>
.settings-row {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  gap: 9px;
  padding: 9px 2px;
  border: 0;
  border-bottom: 1px solid #f2f3f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}
.settings-row:last-child {
  border-bottom: 0;
}
.settings-row__icon {
  display: inline-flex;
  width: 31px;
  height: 31px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #606873;
  background: #f3f4f6;
}
.tone-yellow {
  color: #9b7400;
  background: #fff7dc;
}
.tone-green {
  color: #00895e;
  background: #e9f9f1;
}
.tone-orange {
  color: #d86a00;
  background: #fff3e4;
}
.settings-row__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 1px;
}
.settings-row__copy b {
  color: #3d434b;
  font-size: 12px;
  font-weight: 650;
}
.settings-row__copy span {
  color: #9ca2ab;
  font-size: 8px;
  line-height: 1.45;
}
.settings-row__value {
  flex: none;
  color: #9298a2;
  font-size: 9px;
}
.settings-row__chevron {
  flex: none;
  color: #b6bbc2;
}
.settings-row.is-danger .settings-row__copy b {
  color: #d84a3f;
}
</style>
