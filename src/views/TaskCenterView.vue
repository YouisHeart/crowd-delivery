<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import Icon from '../components/ui/Icon.vue'
import OrderCard from '../components/order/OrderCard.vue'
import { acceptedOrders, cancelledOrders, cityOrders, completedOrders, pickedOrders } from '../stores/appStore'

const router = useRouter()
const active = ref('all')

const tabs = computed(() => [
  { key: 'all', label: '全部', count: cityOrders.value.length },
  { key: 'accepted', label: '待取货', count: acceptedOrders.value.length },
  { key: 'picked', label: '配送中', count: pickedOrders.value.length },
  { key: 'delivered', label: '已完成', count: completedOrders.value.length },
  { key: 'cancelled', label: '已取消', count: cancelledOrders.value.length },
])

const visibleOrders = computed(() => {
  if (active.value === 'accepted') return acceptedOrders.value
  if (active.value === 'picked') return pickedOrders.value
  if (active.value === 'delivered') return completedOrders.value
  if (active.value === 'cancelled') return cancelledOrders.value
  return cityOrders.value
})

function openOrder(order) {
  if (order.status === 'delivered') {
    router.push(`/orders/${order.id}/result/delivered`)
    return
  }
  if (order.status === 'cancelled') {
    router.push(`/orders/${order.id}/result/cancelled`)
    return
  }
  router.push(`/orders/${order.id}`)
}

function onAction(order) {
  openOrder(order)
}
</script>

<template>
  <div class="tasks-page">
    <AppHeader title="我的任务" subtitle="当前工作城市的全部订单" back="/profile" :border="false">
      <template #right>
        <button class="tasks-hall-link" type="button" @click="router.push('/hall')">
          订单大厅
          <Icon name="chevron-right" :size="13" />
        </button>
      </template>
    </AppHeader>

    <div class="tasks-summary">
      <div>
        <span>待取货</span>
        <b>{{ acceptedOrders.length }}</b>
      </div>
      <div>
        <span>配送中</span>
        <b>{{ pickedOrders.length }}</b>
      </div>
      <div>
        <span>已完成</span>
        <b>{{ completedOrders.length }}</b>
      </div>
      <div>
        <span>已取消</span>
        <b>{{ cancelledOrders.length }}</b>
      </div>
    </div>

    <div class="tasks-tabs">
      <button v-for="tab in tabs" :key="tab.key" class="tasks-tab" :class="{ 'is-active': active === tab.key }"
        type="button" @click="active = tab.key">
        {{ tab.label }}
        <span v-if="tab.count">{{ tab.count }}</span>
      </button>
    </div>

    <div class="tasks-body">
      <div v-if="visibleOrders.length" class="tasks-list">
        <template v-for="order in visibleOrders" :key="order.id">
          <OrderCard :order="order" :show-action="order.status !== 'delivered' && order.status !== 'cancelled'"
            @open="openOrder" @action="onAction" />
          <button v-if="order.status === 'delivered' || order.status === 'cancelled'" class="result-link" type="button"
            @click="openOrder(order)">
            查看订单 #{{ order.displayNo }} 结果
            <Icon name="chevron-right" :size="14" />
          </button>
        </template>
      </div>

      <EmptyState v-else icon="orders" title="这里还没有订单" description="去订单大厅抢一个订单，体验完整的取送流程。" action-text="前往订单大厅"
        @action="router.push('/hall')" />
    </div>
  </div>
</template>

<style scoped>
.tasks-page {
  min-height: 100%;
  background: #f4f5f7;
}

.tasks-hall-link {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  border: 0;
  color: #7e858f;
  background: transparent;
  font-size: 10px;
  cursor: pointer;
}

.tasks-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  margin: 3px 14px 12px;
  padding: 12px 4px;
  border-radius: 13px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.tasks-summary div {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid #f0f1f3;
}

.tasks-summary div:last-child {
  border-right: 0;
}

.tasks-summary span {
  color: #989ea8;
  font-size: 9px;
}

.tasks-summary b {
  margin-top: 2px;
  color: #292e35;
  font-family: var(--font-numeric);
  font-size: 22px;
  font-weight: 800;
}

.tasks-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 0 14px 11px;
  scrollbar-width: none;
}

.tasks-tabs::-webkit-scrollbar {
  display: none;
}

.tasks-tab {
  display: inline-flex;
  height: 29px;
  flex: none;
  align-items: center;
  gap: 3px;
  padding: 0 10px;
  border: 1px solid #e9ebee;
  border-radius: 8px;
  color: #7e858f;
  background: #fff;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.tasks-tab.is-active {
  border-color: #17191d;
  color: #fff;
  background: #17191d;
}

.tasks-tab span {
  display: inline-flex;
  min-width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  border-radius: 7px;
  color: #1d1f23;
  background: var(--yellow);
  font-family: var(--font-numeric);
  font-size: 8px;
  font-weight: 800;
}

.tasks-body {
  padding: 0 14px 24px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-link {
  display: flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: -2px;
  border: 1px dashed #dfe2e6;
  border-radius: 9px;
  color: #8c929c;
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}
</style>
