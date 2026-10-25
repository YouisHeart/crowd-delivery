<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppModal from '../components/ui/AppModal.vue'
import BottomSheet from '../components/ui/BottomSheet.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import Icon from '../components/ui/Icon.vue'
import RiderAvatar from '../components/ui/RiderAvatar.vue'
import OrderCard from '../components/order/OrderCard.vue'
import {
  acceptedOrders,
  appState,
  availableOrders,
  cities,
  currentCity,
  grabOrder,
  markNotificationsRead,
  pickedOrders,
  profile,
  pushToast,
  setCity,
  setOnline,
  todayStats,
  unreadNotifications,
} from '../stores/appStore'
import { formatMoney, todayLabel } from '../utils/format'

const router = useRouter()
const activeTab = ref('new')
const menuOpen = ref(false)
const cityOpen = ref(false)
const notificationsOpen = ref(false)
const onlineModal = ref(false)
const grabModal = ref(false)
const aboutOpen = ref(false)
const pendingOrder = ref(null)
const refreshing = ref(false)

const tabs = computed(() => [
  { key: 'new', label: '新任务', count: availableOrders.value.length },
  { key: 'accepted', label: '待取货', count: acceptedOrders.value.length },
  { key: 'picked', label: '配送中', count: pickedOrders.value.length },
])

const visibleOrders = computed(() => {
  if (activeTab.value === 'accepted') return acceptedOrders.value
  if (activeTab.value === 'picked') return pickedOrders.value
  return availableOrders.value
})

const heading = computed(
  () =>
    ({
      new: '附近新任务',
      accepted: '待取货订单',
      picked: '配送中订单',
    })[activeTab.value],
)

const subheading = computed(() => {
  if (!appState.online && activeTab.value === 'new') return '当前离线，配送地址已为你隐藏'
  if (activeTab.value === 'new') return `当前城市 · ${currentCity.value.label}`
  return activeTab.value === 'accepted' ? '请尽快到店取货' : '请注意配送时效与骑行安全'
})

const emptyConfig = computed(() => {
  if (activeTab.value === 'accepted') {
    return {
      icon: 'box',
      title: '暂无待取货订单',
      description: '抢单成功后，订单会出现在这里。',
      actionText: '去抢单',
    }
  }
  if (activeTab.value === 'picked') {
    return {
      icon: 'bike',
      title: '暂无配送中订单',
      description: '取货完成后，可在这里继续配送流程。',
      actionText: '查看待取货',
    }
  }
  return {
    icon: 'orders',
    title: appState.online ? '附近暂时没有新任务' : '上线后查看附近任务',
    description: '数据会根据当前工作城市展示，休息一会儿再刷新看看。',
    actionText: appState.online ? '刷新订单' : '立即上线',
  }
})

function openAction(order) {
  if (order.status === 'available') {
    pendingOrder.value = order
    if (!appState.online) {
      onlineModal.value = true
      return
    }
    grabModal.value = true
    return
  }
  router.push(`/orders/${order.id}`)
}

function openOrder(order) {
  router.push(`/orders/${order.id}`)
}

function confirmGrab() {
  if (!pendingOrder.value) return
  const id = pendingOrder.value.id
  if (grabOrder(id)) {
    grabModal.value = false
    router.push(`/orders/${id}`)
  }
}

function confirmGoOnline() {
  setOnline(true)
  onlineModal.value = false
  if (pendingOrder.value) {
    const id = pendingOrder.value.id
    if (grabOrder(id)) {
      pendingOrder.value = null
      router.push(`/orders/${id}`)
    }
  }
}

function toggleOnlineFromDock() {
  if (appState.online) {
    setOnline(false)
    return
  }
  setOnline(true)
}

function selectCity(city) {
  setCity(city.id)
  cityOpen.value = false
  activeTab.value = 'new'
}

function refreshOrders() {
  refreshing.value = true
  window.setTimeout(() => {
    refreshing.value = false
    pushToast('订单已刷新')
  }, 520)
}

function handleEmptyAction() {
  if (activeTab.value === 'accepted') {
    activeTab.value = 'new'
    return
  }
  if (activeTab.value === 'picked') {
    activeTab.value = 'accepted'
    return
  }
  if (!appState.online) {
    setOnline(true)
    return
  }
  refreshOrders()
}

function openNotifications() {
  notificationsOpen.value = true
  markNotificationsRead()
}

function go(path) {
  menuOpen.value = false
  router.push(path)
}

function openMenuEntry(entry) {
  if (entry.action === 'about') {
    menuOpen.value = false
    aboutOpen.value = true
    return
  }
  go(entry.to)
}

const menuEntries = [
  { label: '订单大厅', icon: 'orders', to: '/hall' },
  { label: '我的任务', icon: 'box', to: '/tasks' },
  { label: '路线规划', icon: 'route', to: '/route' },
  { label: '收益明细', icon: 'wallet', to: '/earnings' },
  { label: '设置', icon: 'settings', to: '/settings' },
  { label: '关于', icon: 'info', action: 'about' },
]
</script>

<template>
  <div class="home-page">
    <header class="home-header">
      <div class="home-brand-row">
        <button class="home-icon-button" type="button" aria-label="打开菜单" @click="menuOpen = true">
          <Icon name="menu" :size="23" />
        </button>
        <div class="home-brand">
          <span class="home-brand__mark">众</span>
          <span class="home-brand__name">美团众包</span>
        </div>
        <button class="home-icon-button home-bell" type="button" aria-label="消息" @click="openNotifications">
          <Icon name="bell" :size="22" />
          <span v-if="unreadNotifications" class="home-bell__dot" />
        </button>
      </div>

      <div class="home-status-row">
        <button class="online-pill" :class="{ 'is-online': appState.online }" type="button" data-testid="online-toggle"
          @click="setOnline(!appState.online)">
          <span class="online-pill__dot" />
          <span>{{ appState.online ? '上线中' : '下线中' }}</span>
          <Icon name="chevron-down" :size="14" />
        </button>
        <button class="city-pill" type="button" @click="cityOpen = true">
          <Icon name="location" :size="13" />
          <span>{{ currentCity.label }}</span>
          <span class="city-pill__weather">28°</span>
        </button>
        <button class="home-avatar" type="button" aria-label="个人中心" @click="router.push('/profile')">
          <RiderAvatar :size="37" />
        </button>
      </div>

      <div class="home-summary">
        <button class="summary-item" type="button" @click="router.push('/earnings')">
          <span class="summary-item__label">今日预计收入</span>
          <strong><small>¥</small>{{ formatMoney(todayStats.income) }}</strong>
          <span class="summary-item__link">账户明细
            <Icon name="chevron-right" :size="11" />
          </span>
        </button>
        <span class="summary-divider" />
        <button class="summary-item" type="button" @click="router.push('/tasks')">
          <span class="summary-item__label">今日完成单量</span>
          <strong>{{ todayStats.orders }}<small>单</small></strong>
          <span class="summary-item__link">订单统计
            <Icon name="chevron-right" :size="11" />
          </span>
        </button>
        <button class="summary-refresh" type="button" :class="{ 'is-spinning': refreshing }" @click="refreshOrders">
          <Icon name="refresh" :size="17" />
        </button>
      </div>

      <div class="home-date-line">
        <span>{{ todayLabel() }} · 午高峰</span>
        <span class="home-date-line__tip">安全骑行，准时送达</span>
      </div>

      <nav class="home-tabs" aria-label="订单状态">
        <button v-for="tab in tabs" :key="tab.key" class="home-tab" :class="{ 'is-active': activeTab === tab.key }"
          type="button" @click="activeTab = tab.key">
          <span>{{ tab.label }}</span>
          <span v-if="tab.count" class="home-tab__count">{{ tab.count }}</span>
        </button>
        <button class="home-tab home-tab--route" type="button" @click="router.push('/route')">
          <span>路线规划</span>
        </button>
      </nav>
    </header>

    <main class="home-body">
      <div v-if="!appState.online" class="offline-banner">
        <span class="offline-banner__icon">
          <Icon name="alert" :size="16" />
        </span>
        <div class="offline-banner__copy">
          <b>当前处于下线状态</b>
          <span>上线后可抢单，配送地址才会展示</span>
        </div>
        <button type="button" @click="setOnline(true)">立即上线</button>
      </div>

      <div class="feed-heading">
        <div>
          <h2>{{ heading }}</h2>
          <p>{{ subheading }}</p>
        </div>
        <button class="feed-refresh" type="button" @click="refreshOrders">
          <Icon name="refresh" :size="14" />
          <span>刷新</span>
        </button>
      </div>

      <div v-if="visibleOrders.length" class="order-list">
        <OrderCard v-for="order in visibleOrders" :key="order.id" :order="order"
          :masked="!appState.online && order.status === 'available'" @open="openOrder" @action="openAction" />
      </div>

      <EmptyState v-else :icon="emptyConfig.icon" :title="emptyConfig.title" :description="emptyConfig.description"
        :action-text="emptyConfig.actionText" @action="handleEmptyAction" />
    </main>

    <footer class="home-dock">
      <button class="dock-settings" type="button" @click="router.push('/settings')">
        <span class="dock-settings__icon">
          <Icon name="settings" :size="19" />
        </span>
        <span>接单设置</span>
      </button>
      <button class="dock-online" :class="{ 'is-online': appState.online }" type="button" data-testid="dock-online"
        @click="toggleOnlineFromDock">
        <span class="dock-online__arrow">{{ appState.online ? '↓' : '↑' }}</span>
        <span>{{ appState.online ? '下线休息' : '上线接单' }}</span>
      </button>
    </footer>

    <BottomSheet v-model="menuOpen" title="更多服务" subtitle="学习环境，所有入口均为本地">
      <div class="menu-grid">
        <button v-for="entry in menuEntries" :key="entry.label" class="menu-entry" type="button"
          @click="openMenuEntry(entry)">
          <span class="menu-entry__icon">
            <Icon :name="entry.icon" :size="21" />
          </span>
          <span>{{ entry.label }}</span>
        </button>
      </div>
      <div class="menu-note">
        <Icon name="shield" :size="15" />
        <span>不接入真实账号、真实订单或线上支付。</span>
      </div>
    </BottomSheet>

    <BottomSheet v-model="cityOpen" title="选择工作城市" subtitle="切换后仅展示该城市的订单">
      <div class="city-list">
        <button v-for="city in cities" :key="city.id" class="city-option"
          :class="{ 'is-active': city.id === appState.cityId }" type="button" @click="selectCity(city)">
          <span class="city-option__icon">
            <Icon name="city" :size="20" />
          </span>
          <span class="city-option__copy">
            <b>{{ city.name }} <small>{{ city.province }}</small></b>
            <span>{{ city.area }} · {{ city.center }}</span>
          </span>
          <Icon v-if="city.id === appState.cityId" name="check" :size="18" class="city-option__check" />
          <Icon v-else name="chevron-right" :size="16" class="city-option__arrow" />
        </button>
      </div>
      <p class="sheet-footnote">可城市：南京、合肥、杭州（浙江）。</p>
    </BottomSheet>

    <BottomSheet v-model="notificationsOpen" title="消息中心" subtitle="通知，不会发送到真实设备">
      <div class="notification-list">
        <div v-for="note in profile.notifications" :key="note.id" class="notification-item">
          <span class="notification-item__dot"
            :class="{ 'is-unread': !appState.readNotificationIds.includes(note.id) }" />
          <div class="notification-item__copy">
            <b>{{ note.title }}</b>
            <p>{{ note.body }}</p>
            <span>{{ note.time }}</span>
          </div>
        </div>
      </div>
    </BottomSheet>

    <AppModal v-model="onlineModal" title="当前为下线状态" subtitle="上线后可抢单，系统也会为你推送订单。" confirm-text="立即上线并抢单"
      @confirm="confirmGoOnline">
      <div class="modal-order-summary">
        <span>待抢订单</span>
        <b>{{ pendingOrder?.merchant.name }}</b>
        <strong>¥{{ formatMoney(pendingOrder?.fee || 0) }}</strong>
      </div>
    </AppModal>

    <AppModal v-model="grabModal" title="确认抢单" subtitle="订单确认后将进入待取货，可在详情页继续操作。" confirm-text="确认抢单"
      @confirm="confirmGrab">
      <div class="grab-summary">
        <div class="grab-summary__row">
          <span>配送费</span>
          <strong>¥{{ formatMoney(pendingOrder?.fee || 0) }}</strong>
        </div>
        <div class="grab-summary__row">
          <span>送达时限</span>
          <span>{{ pendingOrder?.deadline }} · 剩余 {{ pendingOrder?.remainingMin }} 分钟</span>
        </div>
        <div class="grab-summary__route">{{ pendingOrder?.merchant.name }} → {{ pendingOrder?.customer.name }}</div>
      </div>
    </AppModal>

    <AppModal v-model="aboutOpen" title="关于这个学习" subtitle="独立实现的 H5 界面样例" confirm-text="我知道了" hide-cancel
      @confirm="aboutOpen = false">
      <div class="about-copy">
        <p>本项目参考公开可见的骑手工作台信息层级，使用 Vue 3、CSS 和本地 JSON 数据独立重建，不包含原 APK 的代码、图片或私有资源。</p>
        <p>所有商家、地址、顾客信息、收入与订单状态均为虚构，仅用于学习界面设计与交互流程。</p>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  background: #f4f5f7;
}

.home-header {
  flex: none;
  padding: 8px 16px 0;
  color: #fff;
  background:
    radial-gradient(circle at 88% 4%, rgba(255, 209, 0, 0.13), transparent 34%),
    #111214;
}

.home-brand-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-icon-button {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  cursor: pointer;
}

.home-brand {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 7px;
}

.home-brand__mark {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #17191d;
  background: var(--yellow);
  font-size: 13px;
  font-weight: 900;
}

.home-brand__name {
  font-size: 15px;
  font-weight: 850;
  letter-spacing: 0.2px;
}

.home-bell {
  position: relative;
}

.home-bell__dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border: 1.5px solid #111214;
  border-radius: 50%;
  background: #ff453a;
}

.home-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.online-pill {
  display: inline-flex;
  height: 32px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.online-pill__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff6259;
  box-shadow: 0 0 0 3px rgba(255, 98, 89, 0.12);
}

.online-pill.is-online {
  border-color: rgba(255, 209, 0, 0.34);
  color: #1c1d21;
  background: var(--yellow);
}

.online-pill.is-online .online-pill__dot {
  background: #156a4b;
  box-shadow: 0 0 0 3px rgba(21, 106, 75, 0.18);
}

.city-pill {
  display: inline-flex;
  height: 32px;
  align-items: center;
  gap: 3px;
  padding: 0 9px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.05);
  font-size: 11px;
  cursor: pointer;
}

.city-pill__weather {
  margin-left: 2px;
  color: #ffe45c;
  font-family: var(--font-numeric);
  font-size: 10px;
}

.home-avatar {
  display: inline-flex;
  width: 38px;
  height: 38px;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.home-summary {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-top: 14px;
  padding: 11px 12px 10px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 14px;
  background:
    linear-gradient(120deg, rgba(255, 209, 0, 0.17), transparent 58%),
    rgba(255, 255, 255, 0.055);
}

.summary-item {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 4px;
  border: 0;
  color: #fff;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.summary-item__label {
  color: rgba(255, 255, 255, 0.56);
  font-size: 10px;
  font-weight: 600;
}

.summary-item strong {
  margin-top: 2px;
  color: #fff;
  font-family: var(--font-numeric);
  font-size: 26px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.7px;
}

.summary-item strong small {
  margin-left: 2px;
  color: rgba(255, 255, 255, 0.8);
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
}

.summary-item__link {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-top: 4px;
  color: #ffe45c;
  font-size: 9px;
}

.summary-divider {
  width: 1px;
  margin: 3px 8px;
  background: rgba(255, 255, 255, 0.1);
}

.summary-refresh {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex: none;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.summary-refresh.is-spinning svg {
  animation: spin 0.55s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.home-date-line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.44);
  font-size: 9px;
}

.home-date-line__tip {
  color: rgba(255, 209, 0, 0.66);
}

.home-tabs {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  margin-top: 8px;
}

.home-tab {
  position: relative;
  display: inline-flex;
  height: 44px;
  align-items: center;
  gap: 4px;
  padding: 0 8px 9px;
  border: 0;
  color: rgba(255, 255, 255, 0.48);
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
  cursor: pointer;
}

.home-tab.is-active {
  color: #fff;
  font-weight: 800;
}

.home-tab.is-active::after {
  content: "";
  position: absolute;
  right: 9px;
  bottom: 0;
  left: 9px;
  height: 3px;
  border-radius: 2px 2px 0 0;
  background: var(--yellow);
}

.home-tab__count {
  display: inline-flex;
  min-width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 8px;
  color: #1d1f23;
  background: var(--yellow);
  font-family: var(--font-numeric);
  font-size: 9px;
  font-weight: 800;
}

.home-tab--route {
  margin-left: auto;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
}

.home-tab--route::before {
  content: "";
  width: 1px;
  height: 13px;
  margin-right: 5px;
  background: rgba(255, 255, 255, 0.16);
}

.home-body {
  flex: 1;
  padding: 12px 16px 10px;
}

.offline-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 11px;
  padding: 9px 10px;
  border: 1px solid #ffe39a;
  border-radius: 11px;
  background: #fffbed;
}

.offline-banner__icon {
  display: inline-flex;
  width: 27px;
  height: 27px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #dd8b00;
  background: #fff0bd;
}

.offline-banner__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 1px;
}

.offline-banner__copy b {
  color: #604a10;
  font-size: 11px;
  font-weight: 750;
}

.offline-banner__copy span {
  color: #9a8446;
  font-size: 9px;
}

.offline-banner button {
  flex: none;
  height: 25px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  color: #1c1e22;
  background: var(--yellow);
  font-size: 9px;
  font-weight: 750;
  cursor: pointer;
}

.feed-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin: 2px 2px 10px;
}

.feed-heading h2 {
  margin: 0;
  color: #20242a;
  font-size: 18px;
  font-weight: 850;
  letter-spacing: -0.3px;
}

.feed-heading p {
  margin: 3px 0 0;
  color: #8d939d;
  font-size: 10px;
}

.feed-refresh {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 3px;
  padding: 0 8px;
  border: 1px solid #e8eaed;
  border-radius: 7px;
  color: #767d88;
  background: #fff;
  font-size: 10px;
  cursor: pointer;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.home-dock {
  position: sticky;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex: none;
  gap: 9px;
  margin-top: auto;
  padding: 9px 16px 11px;
  border-top: 1px solid rgba(17, 20, 24, 0.045);
  background: linear-gradient(rgba(244, 245, 247, 0.88), #f4f5f7 26%);
  backdrop-filter: blur(12px);
}

.dock-settings {
  display: flex;
  width: 72px;
  flex: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 3px 0;
  border: 0;
  color: #5f6670;
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}

.dock-settings__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #30353c;
}

.dock-online {
  display: flex;
  height: 50px;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 12px;
  color: #181a1e;
  background: var(--yellow);
  box-shadow: 0 7px 17px rgba(255, 208, 0, 0.25);
  font-family: inherit;
  font-size: 16px;
  font-weight: 850;
  cursor: pointer;
}

.dock-online.is-online {
  color: #fff;
  background: #282b31;
  box-shadow: none;
}

.dock-online__arrow {
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(23, 25, 29, 0.27);
  border-radius: 50%;
  font-size: 15px;
  line-height: 1;
}

.dock-online.is-online .dock-online__arrow {
  border-color: rgba(255, 255, 255, 0.32);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.menu-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 13px 6px 11px;
  border: 1px solid #eef0f2;
  border-radius: 12px;
  color: #3e444c;
  background: #fafbfc;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.menu-entry__icon {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: #2e333a;
  background: #fff;
  box-shadow: 0 3px 10px rgba(24, 28, 33, 0.06);
}

.menu-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 15px;
  padding: 10px 11px;
  border-radius: 9px;
  color: #8d939d;
  background: #f6f7f8;
  font-size: 10px;
}

.city-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.city-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #eceef1;
  border-radius: 12px;
  background: #fafbfc;
  text-align: left;
  cursor: pointer;
}

.city-option.is-active {
  border-color: #ffe06a;
  background: #fffdf1;
}

.city-option__icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  color: #5b626c;
  background: #fff;
}

.city-option__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.city-option__copy b {
  color: #292e35;
  font-size: 14px;
  font-weight: 750;
}

.city-option__copy b small {
  margin-left: 4px;
  color: #989ea8;
  font-size: 10px;
  font-weight: 500;
}

.city-option__copy span {
  margin-top: 2px;
  color: #8e949e;
  font-size: 10px;
}

.city-option__check {
  color: #d6a600;
}

.city-option__arrow {
  color: #a1a7b0;
}

.sheet-footnote {
  margin: 14px 0 2px;
  color: #a0a6af;
  font-size: 10px;
  text-align: center;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  gap: 9px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f2f4;
}

.notification-item:last-child {
  border-bottom: 0;
}

.notification-item__dot {
  width: 6px;
  height: 6px;
  flex: none;
  margin-top: 6px;
  border-radius: 50%;
  background: #d7dae0;
}

.notification-item__dot.is-unread {
  background: #ff453a;
}

.notification-item__copy b {
  color: #2c3138;
  font-size: 13px;
  font-weight: 750;
}

.notification-item__copy p {
  margin: 4px 0 5px;
  color: #717884;
  font-size: 11px;
  line-height: 1.55;
}

.notification-item__copy span {
  color: #a0a6af;
  font-size: 9px;
}

.modal-order-summary {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 4px 10px;
  padding: 12px;
  border-radius: 11px;
  background: #f6f7f8;
}

.modal-order-summary span {
  grid-column: 1 / -1;
  color: #959ba5;
  font-size: 10px;
}

.modal-order-summary b {
  overflow: hidden;
  color: #30353d;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-order-summary strong {
  color: #ff453a;
  font-family: var(--font-numeric);
  font-size: 19px;
}

.grab-summary {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 13px;
  border-radius: 11px;
  background: #f7f8f9;
}

.grab-summary__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #7c838d;
  font-size: 11px;
}

.grab-summary__row strong {
  color: #ff453a;
  font-family: var(--font-numeric);
  font-size: 20px;
}

.grab-summary__row span:last-child {
  color: #343940;
  font-weight: 650;
}

.grab-summary__route {
  padding-top: 8px;
  border-top: 1px solid #e9ebee;
  color: #8b929c;
  font-size: 10px;
}

.about-copy p {
  margin: 0 0 10px;
  color: #616873;
  font-size: 12px;
  line-height: 1.65;
}

.about-copy p:last-child {
  margin-bottom: 0;
}

@media (max-width: 360px) {
  .home-header {
    padding-right: 12px;
    padding-left: 12px;
  }

  .home-body {
    padding-right: 12px;
    padding-left: 12px;
  }

  .home-summary {
    padding-right: 8px;
    padding-left: 8px;
  }

  .home-tab {
    padding-right: 6px;
    padding-left: 6px;
    font-size: 13px;
  }

  .summary-item strong {
    font-size: 23px;
  }
}
</style>
