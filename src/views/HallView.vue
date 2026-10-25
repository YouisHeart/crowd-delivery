<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import AppModal from '../components/ui/AppModal.vue'
import BottomSheet from '../components/ui/BottomSheet.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import Icon from '../components/ui/Icon.vue'
import OrderCard from '../components/order/OrderCard.vue'
import {
  appState,
  availableOrders,
  cities,
  cityOrders,
  currentCity,
  grabOrder,
  pushToast,
  setCity,
  setOnline,
} from '../stores/appStore'
import { formatMoney } from '../utils/format'

const router = useRouter()
const typeFilter = ref('all')
const sort = ref('recommended')
const maxDistance = ref(10)
const minFee = ref(0)
const filterOpen = ref(false)
const cityOpen = ref(false)
const onlineModal = ref(false)
const grabModal = ref(false)
const pendingOrder = ref(null)
const refreshing = ref(false)
const draft = ref({ type: 'all', sort: 'recommended', maxDistance: 10, minFee: 0 })

const typeOptions = [
  { key: 'all', label: '全部' },
  { key: 'express', label: '1对1急送' },
  { key: 'errand', label: '跑腿单' },
  { key: 'city', label: '同城' },
]

const sortOptions = [
  { key: 'recommended', label: '综合排序' },
  { key: 'fee', label: '价格优先' },
  { key: 'distance', label: '距离优先' },
  { key: 'time', label: '时效优先' },
]

const feeOptions = [0, 8, 10, 12]

const activeFilterCount = computed(
  () =>
    Number(typeFilter.value !== 'all') +
    Number(sort.value !== 'recommended') +
    Number(maxDistance.value < 10) +
    Number(minFee.value > 0),
)

const filteredOrders = computed(() => {
  let result = [...availableOrders.value]
  if (typeFilter.value !== 'all') {
    result = result.filter((order) => order.typeKey === typeFilter.value)
  }
  if (maxDistance.value < 10) {
    result = result.filter((order) => order.merchant.distanceKm <= maxDistance.value)
  }
  if (minFee.value > 0) {
    result = result.filter((order) => order.fee >= minFee.value)
  }
  if (sort.value === 'fee') result.sort((a, b) => b.fee - a.fee)
  if (sort.value === 'distance') result.sort((a, b) => a.merchant.distanceKm - b.merchant.distanceKm)
  if (sort.value === 'time') result.sort((a, b) => a.remainingMin - b.remainingMin)
  return result
})

const averageFee = computed(() => {
  if (!filteredOrders.value.length) return '0.0'
  const total = filteredOrders.value.reduce((sum, order) => sum + order.fee, 0)
  return formatMoney(total / filteredOrders.value.length)
})

const draftCount = computed(() => {
  let result = [...availableOrders.value]
  if (draft.value.type !== 'all') {
    result = result.filter((order) => order.typeKey === draft.value.type)
  }
  if (draft.value.maxDistance < 10) {
    result = result.filter((order) => order.merchant.distanceKm <= draft.value.maxDistance)
  }
  if (draft.value.minFee > 0) {
    result = result.filter((order) => order.fee >= draft.value.minFee)
  }
  return result.length
})

const activeCityOrders = computed(() => cityOrders.value.length)

function openFilter() {
  draft.value = {
    type: typeFilter.value,
    sort: sort.value,
    maxDistance: maxDistance.value,
    minFee: minFee.value,
  }
  filterOpen.value = true
}

function applyFilter() {
  typeFilter.value = draft.value.type
  sort.value = draft.value.sort
  maxDistance.value = draft.value.maxDistance
  minFee.value = draft.value.minFee
  filterOpen.value = false
}

function resetFilter() {
  draft.value = { type: 'all', sort: 'recommended', maxDistance: 10, minFee: 0 }
}

function openOrder(order) {
  router.push(`/orders/${order.id}`)
}

function onAction(order) {
  if (order.status !== 'available') {
    router.push(`/orders/${order.id}`)
    return
  }
  pendingOrder.value = order
  if (!appState.online) {
    onlineModal.value = true
    return
  }
  grabModal.value = true
}

function confirmGrab() {
  if (!pendingOrder.value) return
  const id = pendingOrder.value.id
  if (grabOrder(id)) {
    grabModal.value = false
    router.push(`/orders/${id}`)
  }
}

function goOnlineAndGrab() {
  setOnline(true)
  onlineModal.value = false
  if (!pendingOrder.value) return
  const id = pendingOrder.value.id
  if (grabOrder(id)) router.push(`/orders/${id}`)
}

function selectCity(city) {
  setCity(city.id)
  cityOpen.value = false
}

function refreshHall() {
  refreshing.value = true
  window.setTimeout(() => {
    refreshing.value = false
    pushToast('订单大厅已刷新')
  }, 550)
}
</script>

<template>
  <div class="hall-page">
    <div class="hall-head">
      <AppHeader title="订单大厅" subtitle="附近可抢订单" :border="false">
        <template #right>
          <button class="hall-head__city" type="button" @click="cityOpen = true">
            <Icon name="location" :size="13" />
            <span>{{ currentCity.name }}</span>
            <Icon name="chevron-down" :size="12" />
          </button>
          <button class="hall-head__filter" type="button" :data-testid="`hall-filter`" @click="openFilter">
            <Icon name="filter" :size="17" />
            <span v-if="activeFilterCount" class="hall-head__badge">{{ activeFilterCount }}</span>
          </button>
        </template>
      </AppHeader>

      <div class="hall-overview">
        <div class="hall-overview__copy">
          <span class="hall-overview__eyebrow">当前工作城市 · {{ currentCity.province }}</span>
          <h2>{{ currentCity.label }}</h2>
          <p>{{ currentCity.notice }}</p>
        </div>
        <div class="hall-overview__stats">
          <div><b>{{ activeCityOrders }}</b><span>今日订单</span></div>
          <div><b>¥{{ averageFee }}</b><span>平均单价</span></div>
        </div>
        <button class="hall-online" :class="{ 'is-online': appState.online }" type="button"
          @click="setOnline(!appState.online)">
          <span class="hall-online__dot" />
          {{ appState.online ? '已上线' : '去上线' }}
        </button>
      </div>

      <div class="hall-type-row">
        <button v-for="option in typeOptions" :key="option.key" class="hall-type"
          :class="{ 'is-active': typeFilter === option.key }" type="button" @click="typeFilter = option.key">
          {{ option.label }}
        </button>
        <button class="hall-sort" type="button" @click="openFilter">
          <Icon name="filter" :size="13" />
          {{sortOptions.find((item) => item.key === sort)?.label}}
        </button>
      </div>
    </div>

    <div class="hall-body">
      <div v-if="!appState.online" class="hall-offline">
        <span>
          <Icon name="info" :size="14" /> 下线状态不会展示顾客完整地址
        </span>
        <button type="button" @click="setOnline(true)">立即上线</button>
      </div>

      <div class="hall-result-head">
        <div>
          <h3>附近订单 <em>{{ filteredOrders.length }}</em></h3>
          <p>根据距离、时效和配送费综合展示</p>
        </div>
        <button class="hall-refresh" :class="{ 'is-spinning': refreshing }" type="button" @click="refreshHall">
          <Icon name="refresh" :size="15" />
          刷新
        </button>
      </div>

      <div v-if="filteredOrders.length" class="hall-list">
        <OrderCard v-for="order in filteredOrders" :key="order.id" :order="order" :masked="!appState.online"
          @open="openOrder" @action="onAction" />
      </div>

      <EmptyState v-else icon="filter" title="没有符合筛选条件的订单" description="可以放宽距离或价格条件，继续查看其他订单。" action-text="重置筛选"
        @action="resetFilter(); applyFilter()" />
    </div>

    <BottomSheet v-model="filterOpen" title="筛选与排序" subtitle="只影响本地订单的展示">
      <div class="filter-section">
        <h4>订单类型</h4>
        <div class="filter-chips">
          <button v-for="option in typeOptions" :key="option.key" class="filter-chip"
            :class="{ 'is-active': draft.type === option.key }" type="button" @click="draft.type = option.key">
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="filter-section">
        <h4>排序方式</h4>
        <div class="filter-chips">
          <button v-for="option in sortOptions" :key="option.key" class="filter-chip"
            :class="{ 'is-active': draft.sort === option.key }" type="button" @click="draft.sort = option.key">
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-label">
          <h4>取货距离</h4>
          <span>{{ draft.maxDistance }}km 内</span>
        </div>
        <input v-model.number="draft.maxDistance" class="range" type="range" min="1" max="10" step="1" />
        <div class="range-scale"><span>1km</span><span>5km</span><span>10km</span></div>
      </div>

      <div class="filter-section">
        <h4>最低配送费</h4>
        <div class="filter-chips">
          <button v-for="fee in feeOptions" :key="fee" class="filter-chip"
            :class="{ 'is-active': draft.minFee === fee }" type="button" @click="draft.minFee = fee">
            {{ fee ? `¥${fee} 以上` : '不限' }}
          </button>
        </div>
      </div>

      <template #footer>
        <button class="btn btn--ghost" type="button" @click="resetFilter">重置</button>
        <button class="btn btn--primary" type="button" data-testid="hall-filter-apply" @click="applyFilter">
          查看 {{ draftCount }} 个结果
        </button>
      </template>
    </BottomSheet>

    <BottomSheet v-model="cityOpen" title="切换工作城市" subtitle="订单、收入与路线均为本地数据">
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
          <Icon v-if="city.id === appState.cityId" name="check" :size="18" />
          <Icon v-else name="chevron-right" :size="16" />
        </button>
      </div>
    </BottomSheet>

    <AppModal v-model="onlineModal" title="上线后才能抢单" subtitle="顾客完整地址、抢单按钮与配送流程将在上线后开放。" confirm-text="立即上线并抢单"
      @confirm="goOnlineAndGrab">
      <div class="hall-modal-order">
        <span>{{ pendingOrder?.merchant.name }}</span>
        <b>¥{{ formatMoney(pendingOrder?.fee || 0) }}</b>
      </div>
    </AppModal>

    <AppModal v-model="grabModal" title="确认抢单" subtitle="抢单成功后可在「待取货」中继续操作。" confirm-text="确认抢单" @confirm="confirmGrab">
      <div class="hall-modal-order">
        <span>{{ pendingOrder?.merchant.name }}</span>
        <b>¥{{ formatMoney(pendingOrder?.fee || 0) }}</b>
      </div>
      <p class="hall-modal-tip">请在 {{ pendingOrder?.deadline }} 前送达 · 距取货点 {{ pendingOrder?.merchant.distanceKm }}km</p>
    </AppModal>
  </div>
</template>

<style scoped>
.hall-page {
  min-height: 100%;
  background: #f4f5f7;
}

.hall-head {
  padding-bottom: 3px;
  background:
    radial-gradient(circle at 92% 0, rgba(255, 209, 0, 0.22), transparent 29%),
    #fff;
}

.hall-head__city {
  display: inline-flex;
  height: 30px;
  align-items: center;
  gap: 3px;
  padding: 0 9px;
  border: 1px solid #e7e9ed;
  border-radius: 15px;
  color: #565d67;
  background: #fff;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.hall-head__filter {
  position: relative;
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #333940;
  background: #f3f4f6;
  cursor: pointer;
}

.hall-head__badge {
  position: absolute;
  top: -1px;
  right: -1px;
  display: inline-flex;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #fff;
  border-radius: 50%;
  color: #1d2025;
  background: var(--yellow);
  font-family: var(--font-numeric);
  font-size: 8px;
  font-weight: 800;
}

.hall-overview {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 16px 12px;
  padding: 14px 14px 13px;
  overflow: hidden;
  border-radius: 15px;
  color: #fff;
  background:
    linear-gradient(110deg, rgba(255, 209, 0, 0.2), transparent 62%),
    #1b1d21;
}

.hall-overview::after {
  content: "";
  position: absolute;
  top: -44px;
  right: -22px;
  width: 130px;
  height: 130px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.hall-overview__copy {
  min-width: 0;
  flex: 1;
}

.hall-overview__eyebrow {
  color: rgba(255, 255, 255, 0.45);
  font-size: 9px;
}

.hall-overview__copy h2 {
  margin: 2px 0 3px;
  color: #fff;
  font-size: 22px;
  font-weight: 850;
  letter-spacing: -0.5px;
}

.hall-overview__copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.56);
  font-size: 9px;
  line-height: 1.5;
}

.hall-overview__stats {
  display: flex;
  flex: none;
  gap: 12px;
  padding-right: 2px;
}

.hall-overview__stats div {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.hall-overview__stats b {
  color: var(--yellow);
  font-family: var(--font-numeric);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.hall-overview__stats span {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 8px;
}

.hall-online {
  position: absolute;
  right: 12px;
  bottom: 9px;
  display: inline-flex;
  height: 22px;
  align-items: center;
  gap: 4px;
  padding: 0 7px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 11px;
  color: rgba(255, 255, 255, 0.66);
  background: rgba(255, 255, 255, 0.06);
  font-size: 8px;
  cursor: pointer;
}

.hall-online__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff6259;
}

.hall-online.is-online {
  color: #1c1e22;
  background: var(--yellow);
}

.hall-online.is-online .hall-online__dot {
  background: #137a54;
}

.hall-type-row {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding: 0 16px 12px;
  scrollbar-width: none;
}

.hall-type-row::-webkit-scrollbar {
  display: none;
}

.hall-type {
  display: inline-flex;
  height: 29px;
  flex: none;
  align-items: center;
  padding: 0 10px;
  border: 1px solid #e9ebee;
  border-radius: 8px;
  color: #747b86;
  background: #fff;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
}

.hall-type.is-active {
  border-color: #17191d;
  color: #fff;
  background: #17191d;
}

.hall-sort {
  display: inline-flex;
  height: 29px;
  flex: none;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  padding: 0 8px;
  border: 0;
  color: #8c929c;
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}

.hall-body {
  padding: 0 16px 12px;
}

.hall-offline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  padding: 9px 11px;
  border-radius: 9px;
  color: #8c7540;
  background: #fffbea;
  font-size: 9px;
}

.hall-offline span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.hall-offline button {
  flex: none;
  height: 24px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  color: #1c1e22;
  background: var(--yellow);
  font-size: 9px;
  font-weight: 750;
  cursor: pointer;
}

.hall-result-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 10px;
  margin: 2px 2px 10px;
}

.hall-result-head h3 {
  margin: 0;
  color: #20242a;
  font-size: 17px;
  font-weight: 850;
  letter-spacing: -0.2px;
}

.hall-result-head h3 em {
  display: inline-flex;
  min-width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  margin-left: 3px;
  padding: 0 5px;
  border-radius: 9px;
  color: #1c1e22;
  background: var(--yellow);
  font-family: var(--font-numeric);
  font-size: 10px;
  font-style: normal;
}

.hall-result-head p {
  margin: 3px 0 0;
  color: #9096a0;
  font-size: 10px;
}

.hall-refresh {
  display: inline-flex;
  height: 28px;
  align-items: center;
  gap: 3px;
  padding: 0 8px;
  border: 1px solid #e7e9ed;
  border-radius: 7px;
  color: #757c87;
  background: #fff;
  font-size: 9px;
  cursor: pointer;
}

.hall-refresh.is-spinning svg {
  animation: spin 0.55s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hall-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.filter-section {
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}

.filter-section:first-child {
  padding-top: 4px;
}

.filter-section:last-of-type {
  border-bottom: 0;
}

.filter-section h4 {
  margin: 0 0 9px;
  color: #333940;
  font-size: 12px;
  font-weight: 750;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-chip {
  height: 31px;
  padding: 0 11px;
  border: 1px solid #eaecf0;
  border-radius: 8px;
  color: #6f7681;
  background: #fafbfc;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.filter-chip.is-active {
  border-color: #17191d;
  color: #fff;
  background: #17191d;
}

.filter-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.filter-label span {
  color: #d69700;
  font-family: var(--font-numeric);
  font-size: 11px;
  font-weight: 700;
}

.range {
  width: 100%;
  margin: 11px 0 2px;
  accent-color: #17191d;
}

.range-scale {
  display: flex;
  justify-content: space-between;
  color: #a2a8b1;
  font-size: 8px;
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

.hall-modal-order {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  background: #f6f7f8;
  color: #3c424a;
  font-size: 12px;
}

.hall-modal-order b {
  color: #ff453a;
  font-family: var(--font-numeric);
  font-size: 20px;
}

.hall-modal-tip {
  margin: 9px 0 0;
  color: #9399a3;
  font-size: 10px;
}
</style>
