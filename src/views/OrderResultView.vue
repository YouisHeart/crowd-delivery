<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import AppModal from '../components/ui/AppModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import Icon from '../components/ui/Icon.vue'
import { getOrderById, pushToast } from '../stores/appStore'
import { formatMoney, formatPrice } from '../utils/format'

const route = useRoute()
const router = useRouter()
const order = computed(() => getOrderById(route.params.id))
const result = computed(() => route.params.result || order.value?.status || 'delivered')
const isDelivered = computed(() => result.value === 'delivered')
const review = ref('')
const helpOpen = ref(false)

const resultCopy = computed(() =>
  isDelivered.value
    ? {
      title: '订单已送达',
      subtitle: '你已完成这单配送，辛苦了',
      icon: 'check',
      accent: 'green',
    }
    : {
      title: '订单已取消',
      subtitle: '这是一次取消，不会影响任何真实账号',
      icon: 'close',
      accent: 'grey',
    },
)

const timeline = computed(() => [
  { label: '抢单', time: '11:22', done: true },
  { label: '取货', time: isDelivered.value ? '11:31' : '--', done: isDelivered.value },
  { label: isDelivered.value ? '送达' : '取消', time: isDelivered.value ? '11:43' : '11:23', done: true },
])

function setReview(value) {
  review.value = value
  pushToast(value === 'good' ? '感谢你的评价' : '已记录评价')
}

function goHome() {
  router.push('/home')
}

function contactSupport() {
  helpOpen.value = true
}
</script>

<template>
  <div v-if="order" class="result-page">
    <AppHeader title="订单结果" back="/home" :border="false">
      <template #right>
        <span class="result-order-no">#{{ order.displayNo }}</span>
      </template>
    </AppHeader>

    <div class="result-hero" :class="`result-hero--${resultCopy.accent}`">
      <span class="result-hero__icon">
        <Icon :name="resultCopy.icon" :size="30" :stroke-width="2.4" />
      </span>
      <h1>{{ resultCopy.title }}</h1>
      <p>{{ resultCopy.subtitle }}</p>
      <span class="result-hero__badge">{{ isDelivered ? '已完成' : '已取消' }}</span>
    </div>

    <div class="result-body">
      <div class="result-card order-summary">
        <div class="summary-top">
          <span class="summary-type" :class="`summary-type--${order.typeKey}`">{{ order.type }}</span>
          <span class="summary-fee">¥{{ formatMoney(order.fee) }}</span>
        </div>
        <h3>{{ order.merchant.name }}</h3>
        <p>{{ order.merchant.address }}</p>
        <div class="summary-arrow">
          <Icon name="arrow-right" :size="14" />
        </div>
        <h3>{{ order.customer.address }}</h3>
        <p>{{ order.customer.name }} · 尾号 {{ order.customer.tail }}</p>
      </div>

      <div class="result-card">
        <div class="card-title">
          <h3>对该顾客满意吗？</h3>
          <span>已对顾客匿名</span>
        </div>
        <div class="review-row">
          <button class="review-button" :class="{ 'is-active': review === 'bad' }" type="button"
            @click="setReview('bad')">
            <span class="review-emoji">😤</span>
            <span>不满意</span>
          </button>
          <button class="review-button" :class="{ 'is-active': review === 'good' }" type="button"
            @click="setReview('good')">
            <span class="review-emoji">😆</span>
            <span>满意</span>
          </button>
        </div>
      </div>

      <div class="result-card">
        <div class="card-title">
          <h3>货品</h3>
          <span>{{ order.goods.summary }}</span>
        </div>
        <div class="goods-list">
          <div v-for="item in order.goods.items" :key="item.name" class="goods-line">
            <span>{{ item.name }}</span>
            <span>x{{ item.qty }}</span>
            <span>¥{{ formatPrice(item.price) }}</span>
          </div>
        </div>
      </div>

      <div v-if="isDelivered" class="result-card income-card">
        <div class="card-title">
          <h3>订单收入</h3>
          <strong>¥{{ formatMoney(order.fee) }}</strong>
        </div>
        <div class="income-line">
          <span>订单基础费用</span>
          <span>¥{{ formatMoney(order.fee - order.bonus) }}</span>
        </div>
        <div v-if="order.bonus" class="income-line">
          <span>活动奖励（）</span>
          <span>¥{{ formatMoney(order.bonus) }}</span>
        </div>
        <div class="income-tip">
          <Icon name="info" :size="13" />
          <span>仅为骑手部分收入,未包含其他活动奖励等收入</span>
        </div>
      </div>

      <div class="result-card timeline-card">
        <div class="card-title">
          <h3>订单时间</h3>
          <span>今日</span>
        </div>
        <div class="timeline">
          <div v-for="step in timeline" :key="step.label" class="timeline-step" :class="{ 'is-done': step.done }">
            <span class="timeline-step__dot" />
            <b>{{ step.label }}</b>
            <span>{{ step.time }}</span>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn btn--ghost" type="button" @click="contactSupport">
          <Icon name="headset" :size="16" /> 联系客服
        </button>
        <button class="btn btn--primary" type="button" data-testid="result-home" @click="goHome">
          返回工作台
        </button>
      </div>
    </div>

    <AppModal v-model="helpOpen" title="客服" subtitle="这里没有真实客服会话或电话。" confirm-text="我知道了" hide-cancel
      @confirm="helpOpen = false">
      <div class="support-copy">
        <Icon name="headset" :size="22" />
        <p>如需继续体验，可返回工作台查看其他订单。真实业务问题请通过官方渠道处理。</p>
      </div>
    </AppModal>
  </div>

  <div v-else class="page">
    <AppHeader title="订单结果" back="/home" />
    <EmptyState icon="orders" title="结果页不存在" description="该订单可能已被重置或删除。" action-text="返回工作台"
      @action="router.push('/home')" />
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100%;
  background: #f4f5f7;
}

.result-order-no {
  color: #8c929c;
  font-family: var(--font-numeric);
  font-size: 12px;
  font-weight: 700;
}

.result-hero {
  position: relative;
  overflow: hidden;
  padding: 4px 20px 22px;
  background: #fff;
}

.result-hero::after {
  content: "";
  position: absolute;
  top: -50px;
  right: -30px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 209, 0, 0.13);
}

.result-hero--grey::after {
  background: rgba(134, 142, 153, 0.08);
}

.result-hero__icon {
  display: inline-flex;
  width: 58px;
  height: 58px;
  align-items: center;
  justify-content: center;
  margin-bottom: 13px;
  border-radius: 50%;
  color: #fff;
  background: var(--green);
  box-shadow: 0 8px 20px rgba(0, 181, 120, 0.2);
}

.result-hero--grey .result-hero__icon {
  background: #858c96;
  box-shadow: 0 8px 20px rgba(113, 120, 130, 0.16);
}

.result-hero h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #17191d;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.8px;
}

.result-hero p {
  position: relative;
  z-index: 1;
  margin: 7px 0 12px;
  color: #8e949e;
  font-size: 12px;
}

.result-hero__badge {
  display: inline-flex;
  height: 22px;
  align-items: center;
  padding: 0 8px;
  border-radius: 5px;
  color: #087b55;
  background: #e8f9f1;
  font-size: 9px;
  font-weight: 750;
}

.result-hero--grey .result-hero__badge {
  color: #747b86;
  background: #f0f2f4;
}

.result-body {
  padding: 12px 14px 28px;
}

.result-card {
  margin-bottom: 10px;
  padding: 14px;
  border-radius: 13px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.order-summary {
  position: relative;
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 9px;
}

.summary-type {
  display: inline-flex;
  height: 20px;
  align-items: center;
  padding: 0 6px;
  border-radius: 5px;
  color: #fff;
  background: #ff3b30;
  font-size: 9px;
  font-weight: 750;
}

.summary-type--errand {
  color: #4e6bff;
  background: #edf1ff;
}

.summary-type--city {
  color: #a87300;
  background: #fff4d6;
}

.summary-fee {
  color: #ff453a;
  font-family: var(--font-numeric);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.order-summary h3 {
  margin: 0;
  color: #272c33;
  font-size: 16px;
  font-weight: 750;
  line-height: 1.35;
}

.order-summary p {
  margin: 3px 0 0;
  color: #969ca6;
  font-size: 10px;
  line-height: 1.45;
}

.summary-arrow {
  display: flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  margin: 2px 0;
  color: #c0c5cc;
  transform: rotate(90deg);
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.card-title h3 {
  margin: 0;
  color: #2b3037;
  font-size: 13px;
  font-weight: 750;
}

.card-title span {
  color: #989ea8;
  font-size: 9px;
}

.card-title strong {
  color: #ff453a;
  font-family: var(--font-numeric);
  font-size: 23px;
  letter-spacing: -0.3px;
}

.review-row {
  display: flex;
  gap: 8px;
  margin-top: 11px;
}

.review-button {
  display: flex;
  height: 48px;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #edf0f3;
  border-radius: 24px;
  color: #5f6671;
  background: #fbfcfd;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.review-button.is-active {
  border-color: #ffd85a;
  color: #2d3036;
  background: #fffbed;
}

.review-emoji {
  font-size: 21px;
  line-height: 1;
}

.goods-list {
  margin-top: 8px;
}

.goods-line {
  display: flex;
  gap: 10px;
  padding: 6px 0;
  border-top: 1px solid #f3f4f6;
  color: #626974;
  font-size: 10px;
}

.goods-line span:first-child {
  min-width: 0;
  flex: 1;
}

.goods-line span:nth-child(2) {
  color: #a1a7b0;
}

.goods-line span:last-child {
  min-width: 44px;
  color: #41474f;
  text-align: right;
}

.income-line {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 9px;
  color: #767d87;
  font-size: 10px;
}

.income-line span:last-child {
  color: #474d55;
  font-weight: 650;
}

.income-tip {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: 11px;
  padding: 8px;
  border-radius: 7px;
  color: #a1a7b0;
  background: #f7f8f9;
  font-size: 8px;
  line-height: 1.5;
}

.timeline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  margin-top: 15px;
}

.timeline-step {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #b1b6be;
}

.timeline-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 5px;
  left: 55%;
  width: 90%;
  height: 1px;
  background: #eef0f2;
}

.timeline-step__dot {
  width: 10px;
  height: 10px;
  border: 2px solid #e0e3e7;
  border-radius: 50%;
  background: #fff;
}

.timeline-step.is-done {
  color: #41474f;
}

.timeline-step.is-done .timeline-step__dot {
  border-color: var(--green);
  background: var(--green);
}

.timeline-step b {
  position: relative;
  z-index: 1;
  margin-top: 3px;
  font-size: 10px;
  font-weight: 650;
}

.timeline-step span:last-child {
  font-family: var(--font-numeric);
  font-size: 9px;
}

.result-actions {
  display: flex;
  gap: 9px;
  margin-top: 14px;
}

.result-actions .btn {
  min-height: 46px;
}

.support-copy {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 10px;
  color: #7e858f;
  background: #f6f7f8;
  font-size: 11px;
  line-height: 1.6;
}

.support-copy p {
  margin: 0;
}
</style>
