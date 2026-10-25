<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import StatusBar from './components/layout/StatusBar.vue'
import BottomNav from './components/layout/BottomNav.vue'
import ToastHost from './components/ui/ToastHost.vue'

const route = useRoute()
const contentRef = ref(null)

const showNav = computed(() => route.meta.bottomNav !== false)
const navKey = computed(() => route.meta.navKey || 'home')
const statusTheme = computed(() => route.meta.statusTheme || 'light')

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    contentRef.value?.scrollTo({ top: 0, behavior: 'instant' })
  },
)
</script>

<template>
  <div class="app-viewport">
    <div class="phone-frame">
      <StatusBar :theme="statusTheme" />
      <main ref="contentRef" class="app-content">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
      <BottomNav v-if="showNav" :active="navKey" />
      <ToastHost />
    </div>
  </div>
</template>
