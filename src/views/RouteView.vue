<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppModal from '../components/ui/AppModal.vue'
import Icon from '../components/ui/Icon.vue'
import SimulatedMap from '../components/map/SimulatedMap.vue'
import {
  acceptedOrders,
  activeOrders,
  currentCity,
  pickedOrders,
  pushToast,
} from '../stores/appStore'
import { nowClock } from '../utils/format'

const router = useRouter()
const routing = ref(false)
const navOpen = ref(false)
const routeNotice = ref('')

const routeStops = computed(() => {
  const list = activeOrders.value
  if (!list.length) return []
  const first = list[0]
  const stops = [
    {
      type: 'pickup',
      point: first.route.pickup,
      no: '1',
      label: first.status === 'picked' ? '已取货' : '取货',
      title: first.merchant.name,
      address: first.merchant.address,
      meta: `门店 · 距你 ${first.merchant.distanceKm}km`,
      order: first,
    },
    {
      type: 'delivery',
      point: first.route.delivery,
      no: '2',
      label: '送达',
      title: first.customer.address,
      address: `${first.customer.name} · 尾号 ${first.customer.tail}`,
      meta: `顾客 · 剩余 ${first.remainingMin} 分钟`,
      order: first,
    },
  ]
  list.slice(1).forEach((order) => {
    stops.push({
      type: 'delivery',
      point: order.route.delivery,
      no: String(stops.length + 1),
      label: '送达',
      title: order.customer.address,
      address: `${order.customer.name} · 尾号 ${order.customer.tail}`,
      meta: `顾客 · 剩余 ${order.remainingMin} 分钟`,
      order,
    })
  })
  return stops
})

const totalCount = computed(() => activeOrders.value.length)

function refreshRoute() {
  routing.value = true
  routeNotice.value = '路线规划已刷新，请注意查看'
  window.setTimeout(() => {
    routing.value = false
    pushToast('路线规划已更新（）')
  }, 900)
  window.setTimeout(() => {
    routeNotice.value = ''
  }, 3600)
}

function navigateTo(stop) {
  pushToast(`导航至${stop.type === 'pickup' ? '取货点' : '送达点'}为占位`)
}

function startNavigation() {
  if (!routeStops.value.length) {
    router.push('/hall')
    return
  }
  navOpen.value = true
}

function openOrder(stop) {
  router.push(`/orders/${stop.order.id}`)
}
</script>

<template>
  <div class="route-page">
    <div class="route-map">
      <SimulatedMap :stops="routeStops" :city="currentCity" :show-labels="true" />
      <div class="route-topbar">
        <button class="route-circle" type="button" aria-label="返回工作台" @click="router.push('/home')">
          <Icon name="chevron-left" :size="22" />
        </button>
        <div class="route-title">
          <b>路线规划</b>
          <span>{{ currentCity.label }} · {{ nowClock() }}</span>
        </div>
        <button class="route-circle" type="button" aria-label="刷新路线" @click="refreshRoute">
          <Icon name="refresh" :size="19" />
        </button>
      </div>

      <Transition name="notice">
        <div v-if="routeNotice" class="route-notice">{{ routeNotice }}</div>
      </Transition>

      <div v-if="routing" class="routing-pill">
        <span class="routing-pill__spinner" />
        算路中
      </div>

      <div class="route-legend">
        <span><i class="legend-dot legend-dot--pickup" />取货点</span>
        <span><i class="legend-dot legend-dot--delivery" />送达点</span>
        <span><i class="legend-dot legend-dot--me" />当前位置</span>
      </div>

      <div class="route-tip">
        <Icon name="info" :size="12" />
        取送路线示意，非导航规划
      </div>
    </div>

    <section class="route-sheet">
      <div class="route-sheet__handle" />
      <div class="route-summary">
        <div>
          <h2>共 {{ totalCount }} 单</h2>
          <p>
            待取货 {{ acceptedOrders.length }} 单
            <span>·</span>
            配送中 {{ pickedOrders.length }} 单
          </p>
        </div>
        <button type="button" @click="refreshRoute">
          <Icon name="refresh" :size="14" />
          刷新路线
        </button>
      </div>

      <div v-if="routeStops.length" class="stop-list">
        <button v-for="stop in routeStops" :key="`${stop.order.id}-${stop.no}`" class="stop-item" type="button"
          @click="openOrder(stop)">
          <span class="stop-number" :class="`stop-number--${stop.type}`">{{ stop.no }}</span>
          <span class="stop-rail" :class="`stop-rail--${stop.type}`">
            <span class="stop-rail__line" />
          </span>
          <span class="stop-copy">
            <span class="stop-label" :class="`stop-label--${stop.type}`">{{ stop.label }}</span>
            <b>{{ stop.title }}</b>
            <span class="stop-address">{{ stop.address }}</span>
            <span class="stop-meta">{{ stop.meta }}</span>
          </span>
          <span class="stop-nav" @click.stop="navigateTo(stop)">
            <Icon name="navigation" :size="18" />
            <span>导航</span>
          </span>
        </button>
      </div>

      <div v-else class="route-empty">
        <span>
          <Icon name="route" :size="26" />
        </span>
        <h3>暂无可规划订单</h3>
        <p>先抢一单，路线会自动出现在这里。</p>
        <button class="btn btn--primary btn--small" type="button" @click="router.push('/hall')">去订单大厅</button>
      </div>

      <div class="route-actions">
        <button class="route-secondary" type="button" @click="router.push('/tasks')">
          <Icon name="orders" :size="18" />
          我的任务
        </button>
        <button class="route-primary" type="button" @click="startNavigation">
          <Icon name="navigation" :size="18" />
          开始导航
        </button>
      </div>
    </section>

    <AppModal v-model="navOpen" title="导航" subtitle="本应用不接入真实地图导航。" confirm-text="知道了" hide-cancel
      @confirm="navOpen = false">
      <div class="nav-demo">
        <span class="nav-demo__icon">
          <Icon name="navigation" :size="24" />
        </span>
        <div>
          <b>{{ routeStops[0]?.title }}</b>
          <p>实际骑行请遵守交通规则，并使用合规地图应用。环境不会获取位置或发起导航。</p>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.route-page {
  display: flex;
  height: 100%;
  min-height: 100%;
  flex-direction: column;
  background: #eef1e9;
}

.route-map {
  position: relative;
  min-height: 245px;
  flex: 0 0 42%;
  overflow: hidden;
}

.route-topbar {
  position: absolute;
  top: 12px;
  right: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.route-circle {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #262a31;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 5px 15px rgba(22, 29, 21, 0.13);
  cursor: pointer;
}

.route-title {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.58);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 14px rgba(22, 29, 21, 0.08);
  backdrop-filter: blur(8px);
}

.route-title b {
  color: #2a2f36;
  font-size: 13px;
  font-weight: 800;
}

.route-title span {
  color: #9098a1;
  font-size: 8px;
}

.route-notice {
  position: absolute;
  top: 65px;
  left: 50%;
  max-width: 270px;
  padding: 9px 13px;
  border-radius: 9px;
  color: #fff;
  background: rgba(37, 40, 45, 0.9);
  box-shadow: 0 8px 24px rgba(20, 24, 20, 0.16);
  font-size: 10px;
  text-align: center;
  transform: translateX(-50%);
  backdrop-filter: blur(8px);
}

.routing-pill {
  position: absolute;
  top: 50%;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 13px;
  border-radius: 18px;
  color: #fff;
  background: rgba(22, 24, 27, 0.86);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  font-size: 11px;
  font-weight: 650;
  transform: translateY(-50%);
}

.routing-pill__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.28);
  border-top-color: var(--yellow);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.route-legend {
  position: absolute;
  right: 14px;
  bottom: 50px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 7px 9px;
  border-radius: 7px;
  color: #6c746d;
  background: rgba(255, 255, 255, 0.83);
  font-size: 8px;
  backdrop-filter: blur(6px);
}

.route-legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.legend-dot--pickup {
  background: #ff7a00;
}

.legend-dot--delivery {
  background: #00b578;
}

.legend-dot--me {
  background: #3478f6;
}

.route-tip {
  position: absolute;
  bottom: 16px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 8px;
  border-radius: 6px;
  color: #6c766d;
  background: rgba(255, 255, 255, 0.8);
  font-size: 8px;
  backdrop-filter: blur(6px);
}

.route-sheet {
  position: relative;
  z-index: 4;
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  margin-top: -18px;
  padding: 0 15px 12px;
  border-radius: 20px 20px 0 0;
  background: #f4f5f7;
  box-shadow: 0 -8px 24px rgba(26, 32, 25, 0.06);
}

.route-sheet__handle {
  width: 34px;
  height: 4px;
  flex: none;
  margin: 8px auto 7px;
  border-radius: 2px;
  background: #d8dce1;
}

.route-summary {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 3px 2px 10px;
}

.route-summary h2 {
  margin: 0;
  color: #20242a;
  font-size: 17px;
  font-weight: 850;
  letter-spacing: -0.2px;
}

.route-summary p {
  margin: 2px 0 0;
  color: #8e959f;
  font-size: 9px;
}

.route-summary p span {
  margin: 0 3px;
  color: #c1c5cc;
}

.route-summary button {
  display: inline-flex;
  height: 27px;
  flex: none;
  align-items: center;
  gap: 3px;
  padding: 0 8px;
  border: 1px solid #e5e8ec;
  border-radius: 7px;
  color: #757c86;
  background: #fff;
  font-size: 9px;
  cursor: pointer;
}

.stop-list {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 1px 0 4px;
  scrollbar-width: none;
}

.stop-list::-webkit-scrollbar {
  display: none;
}

.stop-item {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 7px;
  padding: 10px 10px 10px 7px;
  border: 0;
  border-bottom: 1px solid #eceef1;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.stop-item:first-child {
  border-radius: 11px 11px 0 0;
}

.stop-item:last-child {
  border-bottom: 0;
  border-radius: 0 0 11px 11px;
}

.stop-item:only-child {
  border-radius: 11px;
}

.stop-number {
  display: inline-flex;
  width: 22px;
  height: 22px;
  flex: none;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  border-radius: 50%;
  color: #fff;
  background: #ff7a00;
  font-family: var(--font-numeric);
  font-size: 11px;
  font-weight: 800;
}

.stop-number--delivery {
  background: #00b578;
}

.stop-rail {
  display: flex;
  width: 7px;
  flex: none;
  align-self: stretch;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
}

.stop-rail__line {
  width: 1px;
  flex: 1;
  min-height: 28px;
  background: #e3e6ea;
}

.stop-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  padding-top: 1px;
}

.stop-label {
  align-self: flex-start;
  padding: 1px 4px;
  border-radius: 3px;
  color: #e36d00;
  background: #fff3e4;
  font-size: 8px;
  font-weight: 700;
}

.stop-label--delivery {
  color: #009967;
  background: #e8faf3;
}

.stop-copy b {
  margin-top: 3px;
  overflow: hidden;
  color: #262b32;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stop-address {
  margin-top: 1px;
  overflow: hidden;
  color: #8e949e;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stop-meta {
  margin-top: 3px;
  color: #a0a6af;
  font-size: 8px;
}

.stop-nav {
  display: flex;
  width: 38px;
  flex: none;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 1px 0;
  color: #515862;
  font-size: 8px;
}

.route-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 26px 16px;
  text-align: center;
}

.route-empty>span {
  display: inline-flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  color: #9aa0aa;
  background: #eceef1;
}

.route-empty h3 {
  margin: 9px 0 3px;
  color: #3d434b;
  font-size: 14px;
}

.route-empty p {
  margin: 0 0 12px;
  color: #969ca6;
  font-size: 10px;
}

.route-actions {
  display: flex;
  flex: none;
  gap: 8px;
  padding-top: 9px;
}

.route-secondary,
.route-primary {
  display: inline-flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 0;
  border-radius: 11px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}

.route-secondary {
  width: 112px;
  flex: none;
  color: #555c66;
  background: #eceef1;
}

.route-primary {
  flex: 1;
  color: #1b1d21;
  background: var(--yellow);
  box-shadow: 0 6px 16px rgba(255, 208, 0, 0.22);
}

.notice-enter-active,
.notice-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.notice-enter-from,
.notice-leave-to {
  opacity: 0;
  transform: translate(-50%, -5px);
}

.nav-demo {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f8f9;
}

.nav-demo__icon {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #1c1e22;
  background: var(--yellow);
}

.nav-demo b {
  color: #3c424a;
  font-size: 12px;
}

.nav-demo p {
  margin: 4px 0 0;
  color: #8d939d;
  font-size: 10px;
  line-height: 1.55;
}
</style>
