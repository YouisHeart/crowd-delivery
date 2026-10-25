<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import AppModal from '../components/ui/AppModal.vue'
import BottomSheet from '../components/ui/BottomSheet.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import Icon from '../components/ui/Icon.vue'
import RiderAvatar from '../components/ui/RiderAvatar.vue'
import SimulatedMap from '../components/map/SimulatedMap.vue'
import {
  appState,
  cancelOrder,
  cities,
  deliverOrder,
  getOrderById,
  grabOrder,
  pickupOrder,
  pushToast,
  setOnline,
  transferOrder,
} from '../stores/appStore'
import { formatMoney, formatPrice, primaryAction, statusText } from '../utils/format'

const route = useRoute()
const router = useRouter()
const order = computed(() => getOrderById(route.params.id))
const city = computed(() => cities.find((item) => item.id === order.value?.cityId) || cities[0])

const goodsOpen = ref(false)
const contactOpen = ref(false)
const issueOpen = ref(false)
const transferOpen = ref(false)
const cancelOpen = ref(false)
const onlineModal = ref(false)
const grabModal = ref(false)
const issueReason = ref('')

const isMasked = computed(
  () => Boolean(order.value && order.value.status === 'available' && !appState.online),
)

const headline = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'delivered') return '订单已送达'
  if (order.value.status === 'cancelled') return '订单已取消'
  return `剩余 ${order.value.remainingMin} 分钟（${order.value.deadline}送达）`
})

const actionText = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'delivered') return '查看订单结果'
  if (order.value.status === 'cancelled') return '订单已取消'
  return primaryAction(order.value.status)
})

const progressIndex = computed(() => {
  if (!order.value) return 0
  if (order.value.status === 'available') return 0
  if (order.value.status === 'accepted') return 1
  if (order.value.status === 'picked') return 2
  if (order.value.status === 'delivered') return 3
  return 0
})

const progressSteps = [
  { label: '抢单', hint: '订单已领取' },
  { label: '取货', hint: '到店取货' },
  { label: '送达', hint: '交付顾客' },
]

const issueReasons = ['商家出餐慢', '联系不上顾客', '地址/门牌异常', '其他问题']

function goBack() {
  router.push('/home')
}

function navigateTo(target) {
  pushToast(`${target === 'pickup' ? '取货点' : '送达点'}导航为占位`)
}

function locateMe() {
  pushToast('已回到当前位置')
}

function refreshRoute() {
  pushToast('路线已刷新')
}

function handlePrimary() {
  if (!order.value) return
  const id = order.value.id
  if (order.value.status === 'delivered') {
    router.push(`/orders/${id}/result/delivered`)
    return
  }
  if (order.value.status === 'cancelled') return
  if (order.value.status === 'available') {
    if (!appState.online) {
      onlineModal.value = true
      return
    }
    grabModal.value = true
    return
  }
  if (order.value.status === 'accepted') {
    pickupOrder(id)
    return
  }
  if (order.value.status === 'picked') {
    if (deliverOrder(id)) router.push(`/orders/${id}/result/delivered`)
  }
}

function confirmGrab() {
  if (!order.value) return
  if (grabOrder(order.value.id)) {
    grabModal.value = false
  }
}

function onlineAndGrab() {
  setOnline(true)
  onlineModal.value = false
  if (order.value && grabOrder(order.value.id)) {
    grabModal.value = false
  }
}

function confirmTransfer() {
  if (!order.value) return
  if (transferOrder(order.value.id)) {
    transferOpen.value = false
    router.push('/home')
  }
}

function confirmCancel() {
  if (!order.value) return
  cancelOrder(order.value.id)
  cancelOpen.value = false
  router.push(`/orders/${order.value.id}/result/cancelled`)
}

function showContact(reason) {
  pushToast(`${reason}联系为操作，不会发起真实通话`)
}

function submitIssue() {
  if (!issueReason.value) {
    pushToast('请选择一个问题类型', 'warning')
    return
  }
  issueOpen.value = false
  pushToast(`已提交「${issueReason.value}」反馈`, 'success')
  issueReason.value = ''
}

function openIssue() {
  issueOpen.value = true
}

const actionClass = computed(() => {
  if (!order.value) return 'btn--primary'
  if (order.value.status === 'accepted') return 'btn--orange'
  if (order.value.status === 'picked') return 'btn--green'
  if (order.value.status === 'delivered') return 'btn--dark'
  if (order.value.status === 'cancelled') return 'btn--ghost'
  return 'btn--primary'
})
</script>

<template>
  <div v-if="order" class="detail-page">
    <div class="detail-map">
      <SimulatedMap :order="order" :city="city" :show-current-location="order.status !== 'delivered'" />

      <div class="map-topbar">
        <button class="map-circle" type="button" aria-label="返回" @click="goBack">
          <Icon name="chevron-left" :size="24" />
        </button>
        <div class="map-tip">
          <Icon name="info" :size="13" />
          <span>取送路线示意，非导航规划，请遵守交规</span>
        </div>
        <button class="map-avatar" type="button" aria-label="个人中心" @click="router.push('/profile')">
          <RiderAvatar :size="38" />
        </button>
      </div>

      <button class="map-feedback" type="button" @click="openIssue">
        <Icon name="doc" :size="18" />
        <span>反馈</span>
      </button>

      <div class="map-tools">
        <button type="button" aria-label="定位" @click="locateMe">
          <Icon name="compass" :size="19" />
        </button>
        <button type="button" aria-label="刷新路线" @click="refreshRoute">
          <Icon name="refresh" :size="18" />
        </button>
      </div>

      <div class="map-bike">
        <Icon name="bike" :size="20" />
        <span>骑行</span>
      </div>
    </div>

    <section class="detail-sheet">
      <div class="sheet-grabber" />
      <div class="detail-status">
        <div class="detail-status__left">
          <span class="detail-type" :class="`detail-type--${order.typeKey}`">{{ order.type }}</span>
          <span class="detail-countdown">{{ headline }}</span>
        </div>
        <span class="detail-number">#{{ order.displayNo }}</span>
      </div>

      <div class="detail-tagline">
        <span class="detail-fee"><b>¥{{ formatMoney(order.fee) }}</b> 预计收入</span>
        <span class="detail-bonus">{{ order.bonusLabel }}</span>
      </div>

      <div class="detail-tags">
        <span v-for="tag in order.tags" :key="tag" class="detail-tag">{{ tag }}</span>
        <span class="detail-tag detail-tag--soft">{{ statusText(order.status) }}</span>
      </div>
      <div class="detail-card route-card">
        <div class="route-line">
          <span class="route-line__dot route-line__dot--pickup" />
          <span class="route-line__rail" />
          <span class="route-line__dot route-line__dot--drop" />
        </div>
        <div class="route-content">
          <div class="route-row">
            <div class="route-row__copy">
              <span class="route-row__label">取货</span>
              <h3>{{ order.merchant.name }}</h3>
              <p>{{ order.merchant.address }}</p>
              <span class="route-row__distance">距你 {{ order.merchant.distanceKm }}km · {{ order.merchant.category
              }}</span>
            </div>
            <button class="route-nav" type="button" aria-label="导航到取货点" @click="navigateTo('pickup')">
              <Icon name="navigation" :size="18" />
              <span>导航</span>
            </button>
          </div>

          <div class="route-row route-row--drop">
            <div class="route-row__copy">
              <span class="route-row__label route-row__label--drop">送达</span>
              <template v-if="isMasked">
                <h3 class="masked-title">上线后，才能查看配送地址</h3>
                <p>顾客信息将在上线后展示</p>
              </template>
              <template v-else>
                <h3>{{ order.customer.address }}</h3>
                <p>{{ order.customer.name }} · 尾号 {{ order.customer.tail }}</p>
                <div class="route-row__chips">
                  <span v-for="tag in order.customer.tags" :key="tag">{{ tag }}</span>
                </div>
              </template>
            </div>
            <button class="route-nav" type="button" aria-label="导航到送达点" @click="navigateTo('delivery')">
              <Icon name="navigation" :size="18" />
              <span>导航</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="!isMasked" class="customer-note">
        <Icon name="info" :size="15" />
        <div><b>顾客备注</b><span>{{ order.customer.note }}</span></div>
      </div>

      <div class="detail-card goods-card">
        <button class="goods-head" type="button" @click="goodsOpen = !goodsOpen">
          <div>
            <b>货品</b>
            <span>{{ order.goods.summary }}</span>
          </div>
          <span class="goods-head__right">
            <em>实付 ¥{{ formatPrice(order.goods.paid) }}</em>
            <Icon name="chevron-down" :size="15" :class="{ 'is-open': goodsOpen }" />
          </span>
        </button>
        <div v-if="goodsOpen" class="goods-items">
          <div v-for="item in order.goods.items" :key="item.name" class="goods-item">
            <span class="goods-item__name">{{ item.name }}</span>
            <span>x{{ item.qty }}</span>
            <span>¥{{ formatPrice(item.price) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-card meta-card">
        <div class="meta-row">
          <span>订单编号</span>
          <b>{{ order.id }}</b>
        </div>
        <div class="meta-row">
          <span>配送距离</span>
          <b>{{ (order.merchant.distanceKm + order.customer.distanceKm).toFixed(1) }} km</b>
        </div>
        <div class="meta-row">
          <span>要求送达</span>
          <b>{{ order.deadline }}</b>
        </div>
        <div class="meta-row">
          <span>收入说明</span>
          <b>{{order.fee}}</b>
        </div>
      </div>
    </section>

    <footer class="detail-actions">
      <button class="detail-action" type="button" @click="contactOpen = true">
        <Icon name="phone" :size="20" />
        <span>联系</span>
      </button>
      <button class="detail-action" type="button" @click="openIssue">
        <Icon name="alert" :size="20" />
        <span>遇到问题</span>
      </button>
      <button v-if="order.status === 'accepted'" class="detail-action" type="button" @click="transferOpen = true">
        <Icon name="transfer" :size="20" />
        <span>转单</span>
      </button>
      <button class="detail-primary btn" :class="actionClass" type="button" data-testid="detail-primary"
        :disabled="order.status === 'cancelled'" @click="handlePrimary">
        <span v-if="order.status === 'available'" class="primary-chevron">
          <Icon name="chevron-right" :size="17" />
        </span>
        {{ actionText }}
      </button>
    </footer>

    <BottomSheet v-model="contactOpen" title="联系订单相关方" subtitle="环境不会发起真实通话">
      <div class="contact-list">
        <button class="contact-row" type="button" @click="showContact('顾客')">
          <span class="contact-row__avatar">顾</span>
          <span class="contact-row__copy"><b>顾客 · 尾号 {{ order.customer.tail }}</b></span>
          <span class="contact-row__action">
            <Icon name="phone" :size="18" />
          </span>
        </button>
        <button class="contact-row" type="button" @click="showContact('商家')">
          <span class="contact-row__avatar contact-row__avatar--orange">{{ order.merchant.emoji }}</span>
          <span class="contact-row__copy"><b>{{ order.merchant.name }}</b><span>取货点 · {{ order.merchant.address
          }}</span></span>
          <span class="contact-row__action">
            <Icon name="phone" :size="18" />
          </span>
        </button>
        <button class="contact-row" type="button" @click="showContact('客服')">
          <span class="contact-row__avatar contact-row__avatar--dark">
            <Icon name="headset" :size="18" />
          </span>
          <span class="contact-row__copy"><b>骑手客服</b><span>在线帮助 · 入口</span></span>
          <span class="contact-row__action">
            <Icon name="phone" :size="18" />
          </span>
        </button>
      </div>
    </BottomSheet>

    <BottomSheet v-model="issueOpen" title="遇到问题" subtitle="选择一个问题类型，提交反馈">
      <div class="issue-list">
        <button v-for="reason in issueReasons" :key="reason" class="issue-option"
          :class="{ 'is-active': issueReason === reason }" type="button" @click="issueReason = reason">
          <span>{{ reason }}</span>
          <Icon v-if="issueReason === reason" name="check" :size="16" />
        </button>
      </div>
      <button v-if="['available', 'accepted', 'picked'].includes(order.status)" class="cancel-demo-link" type="button"
        @click="issueOpen = false; cancelOpen = true">
        取消订单
        <Icon name="chevron-right" :size="13" />
      </button>
      <template #footer>
        <button class="btn btn--ghost" type="button" @click="issueOpen = false">返回</button>
        <button class="btn btn--primary" type="button" @click="submitIssue">提交反馈</button>
      </template>
    </BottomSheet>

    <AppModal v-model="onlineModal" title="上线后才能抢单" subtitle="上线后可查看顾客地址并继续配送流程。" confirm-text="立即上线并抢单"
      @confirm="onlineAndGrab">
      <div class="detail-modal-line">
        <span>{{ order.merchant.name }}</span>
        <b>¥{{ formatMoney(order.fee) }}</b>
      </div>
    </AppModal>

    <AppModal v-model="grabModal" title="确认抢单" subtitle="这是本地订单，不会产生真实配送任务。" confirm-text="确认抢单" @confirm="confirmGrab">
      <div class="detail-modal-line">
        <span>{{ order.merchant.name }}</span>
        <b>¥{{ formatMoney(order.fee) }}</b>
      </div>
      <p class="detail-modal-tip">预计 {{ order.remainingMin }} 分钟内送达 · {{ order.customer.distanceKm }}km</p>
    </AppModal>

    <AppModal v-model="transferOpen" title="确认转单" subtitle="转单后该订单会回到订单大厅，状态恢复为待抢单。" confirm-text="确认转单"
      @confirm="confirmTransfer">
      <div class="transfer-copy">
        <Icon name="transfer" :size="18" />
        <span>订单 #{{ order.displayNo }} · {{ order.merchant.name }} → {{ order.customer.name }}</span>
      </div>
    </AppModal>

    <AppModal v-model="cancelOpen" title="取消订单" subtitle="这是本地操作，只会改变订单状态。" confirm-text="确认取消" confirm-tone="danger"
      @confirm="confirmCancel">
      <div class="cancel-copy">
        <Icon name="alert" :size="18" />
        <span>订单 #{{ order.displayNo }} 取消后将进入结果页，可在「我的任务」中查看已取消记录。不会影响真实骑手账号或真实订单。</span>
      </div>
    </AppModal>
  </div>

  <div v-else class="page">
    <AppHeader title="订单详情" back="/home" />
    <EmptyState icon="orders" title="订单不存在" description="该订单可能已被重置或删除。" action-text="返回工作台"
      @action="router.push('/home')" />
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background: #eef1e9;
}

.detail-map {
  position: relative;
  min-height: 252px;
  flex: 0 0 37%;
  overflow: hidden;
}

.detail-map::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 30px;
  background: linear-gradient(transparent, rgba(238, 241, 233, 0.55));
  pointer-events: none;
}

.map-topbar {
  position: absolute;
  top: 12px;
  right: 13px;
  left: 13px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.map-circle {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: none;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #20242a;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 5px 16px rgba(20, 26, 20, 0.13);
  cursor: pointer;
}

.map-tip {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 2px;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  color: #49677b;
  background: rgba(227, 243, 255, 0.88);
  box-shadow: 0 3px 10px rgba(40, 66, 83, 0.06);
  font-size: 9px;
  font-weight: 600;
  text-align: center;
  backdrop-filter: blur(6px);
}

.map-tip span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-avatar {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: none;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: 0 5px 16px rgba(20, 26, 20, 0.13);
  cursor: pointer;
}

.map-feedback {
  position: absolute;
  top: 75px;
  right: 14px;
  display: flex;
  width: 44px;
  height: 52px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 0;
  border-radius: 11px;
  color: #3b4148;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 5px 16px rgba(20, 26, 20, 0.1);
  font-size: 8px;
  cursor: pointer;
}

.map-tools {
  position: absolute;
  right: 14px;
  bottom: 48px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-tools button {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #32373e;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 5px 15px rgba(20, 26, 20, 0.12);
  cursor: pointer;
}

.map-bike {
  position: absolute;
  bottom: 46px;
  left: 14px;
  display: flex;
  width: 48px;
  height: 48px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border-radius: 11px;
  color: #343a41;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 5px 15px rgba(20, 26, 20, 0.1);
  font-size: 8px;
}

.map-credit {
  position: absolute;
  bottom: 15px;
  left: 50%;
  color: rgba(65, 79, 68, 0.48);
  font-size: 8px;
  transform: translateX(-50%);
  pointer-events: none;
}

.detail-sheet {
  position: relative;
  z-index: 4;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  margin-top: -18px;
  padding: 0 14px 18px;
  border-radius: 20px 20px 0 0;
  background: #f4f5f7;
  box-shadow: 0 -8px 24px rgba(26, 32, 25, 0.06);
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.detail-sheet::-webkit-scrollbar {
  display: none;
}

.sheet-grabber {
  width: 34px;
  height: 4px;
  margin: 8px auto 9px;
  border-radius: 2px;
  background: #d9dde2;
}

.detail-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.detail-status__left {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.detail-type {
  display: inline-flex;
  height: 20px;
  flex: none;
  align-items: center;
  padding: 0 6px;
  border-radius: 5px;
  color: #fff;
  background: #ff3b30;
  font-size: 10px;
  font-weight: 750;
}

.detail-type--errand {
  color: #4e6bff;
  background: #edf1ff;
}

.detail-type--city {
  color: #a87300;
  background: #fff4d6;
}

.detail-countdown {
  overflow: hidden;
  color: #343a42;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-number {
  flex: none;
  color: #17191d;
  font-family: var(--font-numeric);
  font-size: 23px;
  font-weight: 850;
  letter-spacing: -0.6px;
}

.detail-tagline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 9px;
  background: #fff8e8;
}

.detail-fee {
  color: #8d6a21;
  font-size: 10px;
}

.detail-fee b {
  margin-right: 3px;
  color: #ff453a;
  font-family: var(--font-numeric);
  font-size: 18px;
}

.detail-bonus {
  color: #f05f45;
  font-size: 9px;
  text-align: right;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}

.detail-tag {
  padding: 3px 6px;
  border-radius: 4px;
  color: #f05f45;
  background: #fff0ed;
  font-size: 9px;
  font-weight: 600;
}

.detail-tag--soft {
  color: #6f7680;
  background: #eef0f3;
}

.progress-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  margin-top: 10px;
  padding: 10px 10px 9px;
  border-radius: 11px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.progress-step {
  position: relative;
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 5px;
  color: #b0b5bd;
}

.progress-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 9px;
  right: 4px;
  left: 23px;
  height: 1px;
  background: #eef0f2;
}

.progress-step__dot {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f1f2f4;
  font-family: var(--font-numeric);
  font-size: 9px;
  font-weight: 700;
}

.progress-step.is-done .progress-step__dot {
  color: #fff;
  background: #00b578;
}

.progress-step.is-current .progress-step__dot {
  color: #1d2025;
  background: var(--yellow);
}

.progress-step b {
  display: block;
  margin-top: 1px;
  color: #767d87;
  font-size: 10px;
  font-weight: 700;
}

.progress-step span {
  display: block;
  margin-top: 1px;
  color: #a2a8b1;
  font-size: 8px;
  white-space: nowrap;
}

.progress-step.is-done b,
.progress-step.is-current b {
  color: #333940;
}

.detail-card {
  margin-top: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.route-card {
  display: flex;
  gap: 8px;
}

.route-line {
  display: flex;
  width: 11px;
  flex: none;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
}

.route-line__dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: #ff7a00;
}

.route-line__dot--drop {
  background: #00b578;
}

.route-line__rail {
  width: 1px;
  flex: 1;
  min-height: 44px;
  margin: 4px 0;
  background: #e0e3e7;
}

.route-content {
  min-width: 0;
  flex: 1;
}

.route-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.route-row--drop {
  margin-top: 15px;
}

.route-row__copy {
  min-width: 0;
  flex: 1;
}

.route-row__label {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 3px;
  color: #e56e00;
  background: #fff3e5;
  font-size: 8px;
  font-weight: 700;
}

.route-row__label--drop {
  color: #009b67;
  background: #e8faf3;
}

.route-row__copy h3 {
  margin: 4px 0 2px;
  color: #242930;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.35;
  letter-spacing: -0.2px;
}

.route-row__copy p {
  margin: 0;
  color: #8c929c;
  font-size: 10px;
  line-height: 1.45;
}

.route-row__copy h3.masked-title {
  color: #777e88;
  font-size: 14px;
  font-weight: 600;
}

.route-row__distance {
  display: inline-block;
  margin-top: 4px;
  color: #9ba1aa;
  font-size: 9px;
}

.route-row__chips {
  display: flex;
  gap: 4px;
  margin-top: 5px;
}

.route-row__chips span {
  padding: 2px 5px;
  border: 1px solid #e8eaed;
  border-radius: 3px;
  color: #737a85;
  font-size: 8px;
}

.route-nav {
  display: flex;
  width: 42px;
  flex: none;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 3px 0;
  border: 0;
  color: #4f565f;
  background: transparent;
  font-size: 8px;
  cursor: pointer;
}

.customer-note {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 10px;
  padding: 10px 11px;
  border: 1px solid #ffe4b5;
  border-radius: 10px;
  color: #d98000;
  background: #fff9ed;
}

.customer-note div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.customer-note b {
  color: #8b671e;
  font-size: 9px;
}

.customer-note span {
  color: #98783c;
  font-size: 10px;
  line-height: 1.5;
}

.goods-card {
  padding: 0;
}

.goods-head {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.goods-head div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}

.goods-head b {
  color: #2d3239;
  font-size: 12px;
  font-weight: 750;
}

.goods-head div span {
  color: #959ba5;
  font-size: 9px;
}

.goods-head__right {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 4px;
}

.goods-head__right em {
  color: #5d646e;
  font-size: 10px;
  font-style: normal;
}

.goods-head__right svg {
  color: #9096a0;
  transition: transform 0.18s ease;
}

.goods-head__right svg.is-open {
  transform: rotate(180deg);
}

.goods-items {
  padding: 0 12px 12px;
}

.goods-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  color: #626974;
  font-size: 10px;
}

.goods-item__name {
  min-width: 0;
  flex: 1;
}

.goods-item span:nth-child(2) {
  color: #a0a6af;
}

.goods-item span:last-child {
  min-width: 44px;
  color: #3f454d;
  text-align: right;
}

.meta-card {
  padding-top: 9px;
  padding-bottom: 9px;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 5px 0;
  color: #9aa0a9;
  font-size: 9px;
}

.meta-row b {
  color: #666d77;
  font-family: var(--font-numeric);
  font-size: 9px;
  font-weight: 650;
}

.detail-actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: 6px;
  padding: 8px 12px calc(9px + env(safe-area-inset-bottom));
  border-top: 1px solid #eceef1;
  background: #fff;
  box-shadow: 0 -6px 18px rgba(24, 28, 33, 0.04);
}

.detail-action {
  display: flex;
  width: 48px;
  flex: none;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 1px 0;
  border: 0;
  color: #555c66;
  background: transparent;
  font-size: 8px;
  cursor: pointer;
}

.detail-primary {
  min-height: 48px;
  flex: 1;
  margin-left: 3px;
  border-radius: 24px;
  font-size: 15px;
}

.detail-primary:disabled {
  color: #9ba1aa;
  background: #f1f2f4;
  box-shadow: none;
}

.primary-chevron {
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(27, 29, 33, 0.22);
  border-radius: 50%;
}

.contact-list,
.issue-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eef0f2;
  border-radius: 11px;
  background: #fafbfc;
  text-align: left;
  cursor: pointer;
}

.contact-row__avatar {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #5c626c;
  background: #f0f2f4;
  font-size: 12px;
  font-weight: 750;
}

.contact-row__avatar--orange {
  background: #fff0dd;
}

.contact-row__avatar--dark {
  color: #fff;
  background: #282b31;
}

.contact-row__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.contact-row__copy b {
  overflow: hidden;
  color: #363c44;
  font-size: 12px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-row__copy span {
  margin-top: 2px;
  overflow: hidden;
  color: #969ca6;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-row__action {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #198754;
  background: #e9f9f1;
}

.issue-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 12px;
  border: 1px solid #eef0f2;
  border-radius: 10px;
  color: #555c66;
  background: #fafbfc;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}

.issue-option.is-active {
  border-color: #ffe16b;
  color: #282c32;
  background: #fffdf1;
}

.cancel-demo-link {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 2px;
  margin-top: 10px;
  padding: 10px;
  border: 1px dashed #eadbd9;
  border-radius: 8px;
  color: #d1574b;
  background: #fffafa;
  font-size: 10px;
  cursor: pointer;
}

.cancel-copy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 11px;
  border-radius: 9px;
  color: #8b5b55;
  background: #fff7f5;
  font-size: 10px;
  line-height: 1.6;
}

.cancel-copy svg {
  flex: none;
  color: #d84a3f;
}

.detail-modal-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  color: #454b54;
  background: #f6f7f8;
  font-size: 12px;
}

.detail-modal-line b {
  color: #ff453a;
  font-family: var(--font-numeric);
  font-size: 20px;
}

.detail-modal-tip {
  margin: 8px 0 0;
  color: #9399a3;
  font-size: 10px;
}

.transfer-copy {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  color: #7e5a12;
  background: #fff9e9;
  font-size: 11px;
  line-height: 1.55;
}

@media (max-width: 360px) {
  .map-tip {
    font-size: 8px;
  }

  .detail-sheet {
    padding-right: 12px;
    padding-left: 12px;
  }

  .detail-action {
    width: 43px;
  }
}
</style>
