<script setup>
import { computed, ref } from 'vue'
import Icon from '../components/ui/Icon.vue'
import AppModal from '../components/ui/AppModal.vue'
import { profile, pushToast, todayStats } from '../stores/appStore'
import { formatMoney } from '../utils/format'

const period = ref('today')
const payoutOpen = ref(false)
const detailOpen = ref(false)

const periodOptions = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
]

const current = computed(() => {
  if (period.value === 'week') return profile.week
  if (period.value === 'month') return profile.month
  return todayStats.value
})

const series = computed(() => profile.incomeSeries[period.value])
const maxBar = computed(() => Math.max(...series.value, 1))

const chartLabels = computed(() => {
  if (period.value === 'week') return ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  if (period.value === 'month') return ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周', '第7周', '第8周']
  return ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
})

const stats = computed(() => [
  {
    label: '准时率',
    value: `${current.value.onTimeRate}%`,
    icon: 'timer',
    tone: 'green',
  },
  {
    label: '在线时长',
    value: `${Math.floor(current.value.onlineMinutes / 60)}小时 ${current.value.onlineMinutes % 60}分`,
    icon: 'clock',
    tone: 'yellow',
  },
  {
    label: '完成单量',
    value: `${current.value.orders} 单`,
    icon: 'orders',
    tone: 'blue',
  },
])

function openPayout() {
  payoutOpen.value = true
}

function showDetail() {
  detailOpen.value = true
}

function tapTransaction(item) {
  pushToast(`${item.title} · 明细不可导出`)
}
</script>

<template>
  <div class="earnings-page">
    <header class="earnings-header">
      <div>
        <span class="earnings-eyebrow">RIDER EARNINGS</span>
        <h1>收益</h1>
      </div>
      <button class="earnings-help" type="button" aria-label="收益说明" @click="pushToast('收益为本地数据，不可提现')">
        <Icon name="info" :size="20" />
      </button>
    </header>

    <section class="earnings-hero">
      <div class="earnings-hero__top">
        <div class="period-tabs">
          <button v-for="option in periodOptions" :key="option.key" :class="{ 'is-active': period === option.key }"
            type="button" @click="period = option.key">
            {{ option.label }}
          </button>
        </div>
        <button class="payout-link" type="button" @click="openPayout">
          可提现 ¥{{ formatMoney(profile.week.balance) }}
          <Icon name="chevron-right" :size="13" />
        </button>
      </div>
      <span class="earnings-label">{{periodOptions.find((item) => item.key === period)?.label}}预计收入（元）</span>
      <div class="earnings-amount">
        <small>¥</small>{{ formatMoney(current.income) }}
      </div>
      <div class="earnings-meta">
        <span>奖励 ¥{{ formatMoney(current.bonus) }}</span>
        <i />
        <span>小费 ¥{{ formatMoney(current.tips) }}</span>
        <button type="button" @click="showDetail">收入构成
          <Icon name="chevron-right" :size="12" />
        </button>
      </div>
      <div class="earnings-actions">
        <button type="button" @click="openPayout">去提现</button>
        <button type="button" class="ghost" @click="pushToast('账单下载为占位')">账单明细</button>
      </div>
    </section>

    <main class="earnings-body">
      <section class="earnings-card chart-card">
        <div class="card-head">
          <div>
            <h2>收入趋势</h2>
            <p>{{periodOptions.find((item) => item.key === period)?.label}}分时收入</p>
          </div>
        </div>
        <div class="bar-chart">
          <div v-for="(value, index) in series" :key="index" class="bar-column">
            <span class="bar-value">¥{{ value }}</span>
            <div class="bar-track">
              <span class="bar-fill" :style="{ height: `${Math.max((value / maxBar) * 100, 6)}%` }" />
            </div>
            <span class="bar-label">{{ chartLabels[index] || '' }}</span>
          </div>
        </div>
      </section>

      <section class="earnings-card">
        <div class="card-head">
          <div>
            <h2>跑单数据</h2>
          </div>
        </div>
        <div class="stat-grid">
          <div v-for="item in stats" :key="item.label" class="stat-item">
            <span class="stat-icon" :class="`stat-icon--${item.tone}`">
              <Icon :name="item.icon" :size="17" />
            </span>
            <span class="stat-label">{{ item.label }}</span>
            <b>{{ item.value }}</b>
          </div>
        </div>
      </section>

      <section class="earnings-card">
        <div class="card-head">
          <div>
            <h2>收入明细</h2>
            <p>仅展示最近 5 条记录</p>
          </div>
          <button class="card-link" type="button" @click="pushToast('更多明细为占位')">查看全部</button>
        </div>
        <div class="transaction-list">
          <button v-for="item in profile.transactions" :key="item.id" class="transaction" type="button"
            @click="tapTransaction(item)">
            <span class="transaction-icon" :class="{ 'is-expense': item.type === 'expense' }">
              <Icon :name="item.type === 'expense' ? 'bag' : 'cash'" :size="17" />
            </span>
            <span class="transaction-copy">
              <b>{{ item.title }}</b>
              <span>{{ item.subtitle }}</span>
            </span>
            <span class="transaction-amount" :class="{ 'is-expense': item.amount < 0 }">
              {{ item.amount > 0 ? '+' : '' }}¥{{ formatMoney(Math.abs(item.amount)) }}
            </span>
          </button>
        </div>
      </section>
    </main>

    <AppModal v-model="payoutOpen" title="账户" subtitle="这里没有真实钱包或提现通道。" confirm-text="我知道了" hide-cancel
      @confirm="payoutOpen = false">
      <div class="payout-modal">
        <span class="payout-modal__icon">
          <Icon name="wallet" :size="23" />
        </span>
        <div>
          <b>可提现余额 ¥{{ formatMoney(profile.week.balance) }}</b>
          <p>真实骑手收益与结算以官方应用和所属配送公司为准。本不会收集支付信息，也不会发起任何资金操作。</p>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="detailOpen" title="收入构成" subtitle="仅用于展示界面层级" confirm-text="关闭" hide-cancel
      @confirm="detailOpen = false">
      <div class="income-breakdown">
        <div><span>订单基础收入</span><b>¥{{ formatMoney(current.income - current.bonus - current.tips) }}</b></div>
        <div><span>活动奖励</span><b>+¥{{ formatMoney(current.bonus) }}</b></div>
        <div><span>顾客小费</span><b>+¥{{ formatMoney(current.tips) }}</b></div>
        <div class="total"><span>合计</span><b>¥{{ formatMoney(current.income) }}</b></div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.earnings-page {
  min-height: 100%;
  background: #f4f5f7;
}

.earnings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 18px 13px;
  background: #fff;
}

.earnings-eyebrow {
  color: #a2a8b1;
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.7px;
}

.earnings-header h1 {
  margin: 2px 0 0;
  color: #1d2025;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.earnings-help {
  display: inline-flex;
  width: 35px;
  height: 35px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #6f7681;
  background: #f4f5f7;
  cursor: pointer;
}

.earnings-hero {
  position: relative;
  margin: 0 14px;
  padding: 14px 15px 15px;
  overflow: hidden;
  border-radius: 17px;
  color: #fff;
  background:
    radial-gradient(circle at 89% 10%, rgba(255, 255, 255, 0.23), transparent 32%),
    linear-gradient(135deg, #ffd100 0%, #ffc400 52%, #ffb800 100%);
  box-shadow: 0 10px 24px rgba(223, 176, 0, 0.18);
}

.earnings-hero::after {
  content: "";
  position: absolute;
  right: -47px;
  bottom: -89px;
  width: 220px;
  height: 220px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
}

.earnings-hero__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.period-tabs {
  display: flex;
  gap: 3px;
  padding: 3px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
}

.period-tabs button {
  height: 23px;
  padding: 0 9px;
  border: 0;
  border-radius: 6px;
  color: rgba(40, 37, 17, 0.58);
  background: transparent;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.period-tabs button.is-active {
  color: #282510;
  background: rgba(255, 255, 255, 0.86);
}

.payout-link {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  border: 0;
  color: rgba(40, 37, 17, 0.66);
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}

.earnings-label {
  display: block;
  margin-top: 17px;
  color: rgba(43, 38, 14, 0.6);
  font-size: 10px;
  font-weight: 600;
}

.earnings-amount {
  position: relative;
  z-index: 1;
  margin-top: 1px;
  color: #1d1b0f;
  font-family: var(--font-numeric);
  font-size: 48px;
  font-weight: 850;
  line-height: 1.12;
  letter-spacing: -2px;
}

.earnings-amount small {
  margin-right: 2px;
  font-size: 23px;
  font-weight: 700;
  letter-spacing: 0;
}

.earnings-meta {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
  color: rgba(45, 39, 12, 0.64);
  font-size: 9px;
}

.earnings-meta i {
  width: 1px;
  height: 9px;
  background: rgba(45, 39, 12, 0.2);
}

.earnings-meta button {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-left: auto;
  border: 0;
  color: rgba(45, 39, 12, 0.65);
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}

.earnings-actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 7px;
  margin-top: 13px;
}

.earnings-actions button {
  height: 34px;
  flex: 1;
  border: 0;
  border-radius: 8px;
  color: #1e1c11;
  background: rgba(255, 255, 255, 0.86);
  font-size: 11px;
  font-weight: 750;
  cursor: pointer;
}

.earnings-actions button.ghost {
  color: rgba(34, 30, 10, 0.7);
  background: rgba(255, 255, 255, 0.3);
}

.earnings-body {
  padding: 11px 14px 24px;
}

.earnings-card {
  margin-bottom: 10px;
  padding: 14px;
  border-radius: 13px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.card-head h2 {
  margin: 0;
  color: #2a2f36;
  font-size: 14px;
  font-weight: 800;
}

.card-head p {
  margin: 3px 0 0;
  color: #a0a6af;
  font-size: 9px;
}

.bar-chart {
  display: flex;
  height: 132px;
  align-items: stretch;
  gap: 4px;
  margin-top: 16px;
  padding-bottom: 15px;
}

.bar-column {
  position: relative;
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 3px;
}

.bar-value {
  position: absolute;
  top: -11px;
  color: #adafb4;
  font-family: var(--font-numeric);
  font-size: 7px;
  opacity: 0;
  transition: opacity 0.18s ease;
}

.bar-column:hover .bar-value {
  opacity: 1;
}

.bar-track {
  display: flex;
  width: 100%;
  max-width: 14px;
  flex: 1;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 4px 4px 2px 2px;
  background: #f5f6f7;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 2px 2px;
  background: linear-gradient(#ffd100, #ffbf00);
  transition: height 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.bar-column:nth-child(3n) .bar-fill {
  background: linear-gradient(#2b2f36, #1d2025);
}

.bar-label {
  position: absolute;
  bottom: 0;
  color: #9aa1ab;
  font-size: 7px;
  white-space: nowrap;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 13px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 9px;
  background: #f8f9fa;
}

.stat-icon {
  display: inline-flex;
  width: 27px;
  height: 27px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.stat-icon--green {
  color: #008c5e;
  background: #e8f9f1;
}

.stat-icon--yellow {
  color: #a67900;
  background: #fff7db;
}

.stat-icon--blue {
  color: #416acb;
  background: #edf2ff;
}

.stat-label {
  color: #8e959f;
  font-size: 8px;
}

.stat-item b {
  color: #30353c;
  font-family: var(--font-numeric);
  font-size: 15px;
  font-weight: 750;
}

.card-link {
  border: 0;
  color: #8f959f;
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}

.transaction-list {
  margin-top: 6px;
}

.transaction {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid #f2f3f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.transaction:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.transaction-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: #9b7600;
  background: #fff7dc;
}

.transaction-icon.is-expense {
  color: #8b929c;
  background: #f2f3f5;
}

.transaction-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.transaction-copy b {
  color: #3a4048;
  font-size: 11px;
  font-weight: 650;
}

.transaction-copy span {
  margin-top: 1px;
  overflow: hidden;
  color: #9ca2ab;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-amount {
  flex: none;
  color: #0c9f6c;
  font-family: var(--font-numeric);
  font-size: 15px;
  font-weight: 750;
}

.transaction-amount.is-expense {
  color: #8c929c;
}

.payout-modal {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px;
  border-radius: 11px;
  background: #f7f8f9;
}

.payout-modal__icon {
  display: inline-flex;
  width: 38px;
  height: 38px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #17191d;
  background: var(--yellow);
}

.payout-modal b {
  color: #3b4149;
  font-size: 12px;
}

.payout-modal p {
  margin: 4px 0 0;
  color: #8c929c;
  font-size: 10px;
  line-height: 1.6;
}

.income-breakdown {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 2px 2px;
}

.income-breakdown div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #777e88;
  font-size: 11px;
}

.income-breakdown b {
  color: #3c424a;
  font-family: var(--font-numeric);
  font-size: 12px;
}

.income-breakdown .total {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid #eceef1;
  color: #2d3239;
  font-weight: 700;
}

.income-breakdown .total b {
  color: #ff453a;
  font-size: 20px;
}
</style>
