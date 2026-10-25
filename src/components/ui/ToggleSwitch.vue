<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    class="toggle-switch"
    :class="{ 'is-on': modelValue }"
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    @click="toggle"
  >
    <span />
  </button>
</template>

<style scoped>
.toggle-switch {
  position: relative;
  width: 40px;
  height: 23px;
  flex: none;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: #d9dde2;
  cursor: pointer;
  transition: background 0.2s ease;
}
.toggle-switch span {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(20, 24, 29, 0.18);
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.toggle-switch.is-on {
  background: #17191d;
}
.toggle-switch.is-on span {
  transform: translateX(17px);
  background: var(--yellow);
}
</style>
