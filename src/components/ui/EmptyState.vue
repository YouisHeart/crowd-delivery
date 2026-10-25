<script setup>
import Icon from './Icon.vue'

defineProps({
  icon: { type: String, default: 'box' },
  title: { type: String, default: '暂无内容' },
  description: { type: String, default: '' },
  actionText: { type: String, default: '' },
})

defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon"><Icon :name="icon" :size="30" /></span>
    <h4>{{ title }}</h4>
    <p v-if="description">{{ description }}</p>
    <button v-if="actionText" class="btn btn--dark btn--small" type="button" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 46px 28px;
  text-align: center;
}
.empty-state__icon {
  display: inline-flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  border-radius: 20px;
  color: #9ba1aa;
  background: #f2f3f5;
}
.empty-state h4 {
  margin: 0;
  color: #353a42;
  font-size: 15px;
  font-weight: 750;
}
.empty-state p {
  max-width: 240px;
  margin: 7px 0 15px;
  color: #9399a3;
  font-size: 12px;
  line-height: 1.6;
}
</style>
