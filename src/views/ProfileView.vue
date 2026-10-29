<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppModal from '../components/ui/AppModal.vue'
import BottomSheet from '../components/ui/BottomSheet.vue'
import Icon from '../components/ui/Icon.vue'
import RiderAvatar from '../components/ui/RiderAvatar.vue'
import {
  currentCity,
  profile,
  pushToast,
  signInToday,
  signedInToday,
  todayStats,
} from '../stores/appStore'
import { formatMoney, todayLabel } from '../utils/format'

const router = useRouter()
const signed = computed(() => signedInToday.value)
const selectedPlan = ref(null)
const selectedReward = ref(null)
const serviceOpen = ref(false)
const appealOpen = ref(false)
const planInfoOpen = ref(false)
const signOpen = ref(false)

const levelParts = computed(() => {
  const raw = profile.user.level.replace('荣耀', '')
  return { prefix: '荣耀', name: raw }
})

function openPlan(plan) {
  selectedPlan.value = plan
  planInfoOpen.value = true
}

function openReward(reward) {
  selectedReward.value = reward
}

function signIn() {
  if (signed.value) {
    pushToast('今天已经签到过了')
    return
  }
  signInToday()
  signOpen.value = false
  pushToast('签到成功，获得 1 元奖励', 'success')
}

function openSign() {
  if (signed.value) {
    pushToast('今天已经签到过了')
    return
  }
  signOpen.value = true
}
</script>

<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="profile-header__top">
        <span class="profile-header__eyebrow">个人中心</span>
        <button class="profile-settings" type="button" aria-label="设置" @click="router.push('/settings')">
          <Icon name="settings" :size="20" />
        </button>
      </div>
      <div class="profile-identity">
        <button class="profile-avatar-button" type="button" @click="router.push('/settings')">
          <RiderAvatar :size="62" />
          <span class="profile-avatar-button__status" />
        </button>
        <div class="profile-identity__copy">
          <div class="profile-name-row">
            <h1>{{ profile.user.displayName }}</h1>
            <Icon name="chevron-right" :size="16" />
          </div>
          <div class="profile-badges">
            <span class="level-badge">
              <Icon name="star" :size="11" />
              {{ levelParts.prefix }}{{ levelParts.name }}
            </span>
            <span class="city-badge">
              <Icon name="location" :size="10" />
              {{ currentCity.name }}
            </span>
          </div>
          <p>骑手编号 {{ profile.user.riderId }} · 身份</p>
        </div>
        <button class="profile-level" type="button" @click="pushToast('等级体系为展示')">
          <span class="profile-level__star">
            <Icon name="star" :size="12" />
          </span>
          <b>{{ profile.user.rating }}</b>
          <small>评分</small>
        </button>
      </div>
    </header>

    <main class="profile-body">
      <section class="profile-income-card">
        <div class="profile-income-card__top">
          <span>{{ todayLabel() }} · 今日概览</span>
          <button type="button" @click="router.push('/earnings')">账户明细
            <Icon name="chevron-right" :size="12" />
          </button>
        </div>
        <div class="profile-income-grid">
          <button type="button" @click="router.push('/earnings')">
            <span>今日预计收入（元）</span>
            <b>{{ formatMoney(todayStats.income) }}</b>
            <small>不含未结算周期收入</small>
          </button>
          <button type="button" @click="router.push('/tasks')">
            <span>今日完成单量（单）</span>
            <b>{{ todayStats.orders }}</b>
            <small>准时率 {{ todayStats.onTimeRate }}%</small>
          </button>
        </div>
        <div class="profile-income-links">
          <button type="button" @click="router.push('/earnings')">我的账户
            <Icon name="chevron-right" :size="11" />
          </button>
          <button type="button" @click="router.push('/tasks')">订单统计
            <Icon name="chevron-right" :size="11" />
          </button>
        </div>
        <button class="appeal-button" type="button" @click="appealOpen = true">
          <Icon name="shield" :size="14" />
          违规申诉
        </button>
      </section>

      <div class="quick-grid">
        <button class="quick-card" type="button" @click="router.push('/tasks')">
          <span class="quick-card__label">我的任务</span>
          <strong>{{ profile.tasks.length }}<small>个进行中</small></strong>
          <span class="quick-card__badge">去完成</span>
        </button>
        <button class="quick-card quick-card--gift" type="button" @click="openSign">
          <div>
            <span class="quick-card__label">专属签到礼</span>
            <strong class="quick-card__date">2026.10.19-2026.10.25</strong>
            <span class="quick-card__sub">{{ signed ? '今日已签到' : '今日可签到' }}</span>
          </div>
          <span class="gift-art" aria-hidden="true">
            <span class="gift-art__box" />
            <span class="gift-art__ribbon" />
            <span class="gift-art__spark">✦</span>
          </span>
        </button>
      </div>

      <section class="profile-section">
        <div class="profile-section__head">
          <h2>奖励活动</h2>
          <button type="button" @click="pushToast('更多奖励活动为占位')">查看更多
            <Icon name="chevron-right" :size="12" />
          </button>
        </div>
        <div class="reward-grid">
          <button v-for="reward in profile.rewards" :key="reward.id" class="reward-card" type="button"
            @click="openReward(reward)">
            <span class="reward-card__period">{{ reward.period }}</span>
            <b>{{ reward.title }}</b>
            <span class="reward-card__progress">{{ reward.progress }}</span>
            <span class="reward-card__bar"><i :style="{ width: `${reward.progressValue * 100}%` }" /></span>
          </button>
        </div>
      </section>

      <section class="profile-section">
        <div class="profile-section__head">
          <h2>进阶跑单</h2>
          <button type="button" @click="pushToast('进阶计划为展示')">了解更多
            <Icon name="chevron-right" :size="12" />
          </button>
        </div>
        <div class="plan-grid">
          <button v-for="plan in profile.plans" :key="plan.id" class="plan-item" type="button" @click="openPlan(plan)">
            <span class="plan-glyph" :style="{ color: plan.color }">{{ plan.glyph }}</span>
            <span>{{ plan.title }}</span>
          </button>
        </div>
      </section>

      <section class="profile-section">
        <div class="profile-section__head">
          <h2>工作必备</h2>
          <button type="button" @click="pushToast('工作必备入口均为模拟')">全部
            <Icon name="chevron-right" :size="12" />
          </button>
        </div>
        <div class="essential-list">
          <button v-for="item in profile.workEssentials" :key="item.id" class="essential-item" type="button"
            @click="pushToast(`${item.title}为入口`)">
            <span class="essential-item__icon">
              <Icon :name="item.icon" :size="20" />
            </span>
            <span class="essential-item__copy">
              <b>{{ item.title }}</b>
              <span>{{ item.subtitle }}</span>
            </span>
            <Icon name="chevron-right" :size="15" />
          </button>
        </div>
      </section>

      <div class="profile-version">
        <span>狗团众包</span>
        <span>v1.0.0</span>
      </div>
    </main>

    <button class="service-fab" type="button" @click="serviceOpen = true">
      <Icon name="headset" :size="18" />
      服务中心
    </button>

    <BottomSheet v-model="serviceOpen" title="服务中心" subtitle="客服，不会建立真实会话">
      <div class="service-list">
        <button type="button" @click="serviceOpen = false; pushToast('在线客服为占位')">
          <span class="service-list__icon">
            <Icon name="headset" :size="19" />
          </span>
          <span><b>在线客服</b><small>常见问题与骑手帮助</small></span>
          <Icon name="chevron-right" :size="16" />
        </button>
        <button type="button" @click="serviceOpen = false; pushToast('安全中心为占位')">
          <span class="service-list__icon">
            <Icon name="shield" :size="19" />
          </span>
          <span><b>安全中心</b><small>头盔、保险与骑行安全</small></span>
          <Icon name="chevron-right" :size="16" />
        </button>
        <button type="button" @click="serviceOpen = false; pushToast('意见反馈为占位')">
          <span class="service-list__icon">
            <Icon name="doc" :size="19" />
          </span>
          <span><b>意见反馈</b><small>帮助我们改进体验</small></span>
          <Icon name="chevron-right" :size="16" />
        </button>
      </div>
    </BottomSheet>

    <AppModal v-model="appealOpen" title="违规申诉" subtitle="当前账号没有违规记录" confirm-text="知道了" hide-cancel
      @confirm="appealOpen = false">
      <div class="simple-modal">
        <Icon name="shield" :size="22" />
        <p>本应用不接入真实骑手账号、罚单或申诉系统。你可以在设置中重置所有数据。</p>
      </div>
    </AppModal>

    <AppModal v-model="planInfoOpen" :title="selectedPlan?.title || '进阶跑单'" subtitle="学习计划说明" confirm-text="去订单大厅"
      cancel-text="稍后了解" @confirm="planInfoOpen = false; router.push('/hall')">
      <div class="plan-modal">
        <span class="plan-modal__glyph" :style="{ color: selectedPlan?.color }">{{ selectedPlan?.glyph }}</span>
        <div>
          <b>{{ selectedPlan?.title }}</b>
          <p>这是一个入口，展示进阶跑单计划的视觉样式。不会改变真实的接单资格、派单规则或账号状态。</p>
        </div>
      </div>
    </AppModal>

    <BottomSheet :model-value="Boolean(selectedReward)" :title="selectedReward?.title || '奖励活动'" subtitle="奖励进度为本地数据"
      @update:model-value="selectedReward = null">
      <div class="reward-detail">
        <span class="reward-detail__period">{{ selectedReward?.period }}</span>
        <div class="reward-detail__bar"><i :style="{ width: `${(selectedReward?.progressValue || 0) * 100}%` }" /></div>
        <div class="reward-detail__row">
          <span>当前进度</span>
          <b>{{ selectedReward?.progress }}</b>
        </div>
        <div class="reward-detail__row">
          <span>奖励说明</span>
          <b>仅，不可提现</b>
        </div>
        <button class="btn btn--primary btn--block" type="button"
          @click="selectedReward = null; pushToast('奖励领取为占位')">去完成任务</button>
      </div>
    </BottomSheet>

    <BottomSheet v-model="signOpen" title="专属签到礼" subtitle="连续签到可解锁奖励" @update:model-value="signOpen = $event">
      <div class="sign-card">
        <span class="sign-card__day">DAY {{ signed ? '7' : '6' }}</span>
        <b>{{ signed ? '今日已签到' : '签到得 1 元奖励' }}</b>
        <p>签到记录只保存在当前浏览器的本地存储中，不会上传。</p>
        <div class="sign-days">
          <span v-for="day in 7" :key="day" :class="{ 'is-done': day < 7, 'is-today': day === 7 }">✓</span>
        </div>
      </div>
      <template #footer>
        <button class="btn btn--primary btn--block" type="button" @click="signIn">
          {{ signed ? '今日已签到' : '立即签到' }}
        </button>
      </template>
    </BottomSheet>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100%;
  background: #f4f5f7;
}

.profile-header {
  padding: 10px 16px 38px;
  background:
    radial-gradient(circle at 91% 3%, rgba(255, 209, 0, 0.18), transparent 31%),
    #fff;
}

.profile-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-header__eyebrow {
  color: #a0a6af;
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.5px;
}

.profile-settings {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #30353c;
  background: #f3f4f6;
  cursor: pointer;
}

.profile-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.profile-avatar-button {
  position: relative;
  display: inline-flex;
  flex: none;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.profile-avatar-button__status {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 11px;
  height: 11px;
  border: 2px solid #fff;
  border-radius: 50%;
  background: #00b578;
}

.profile-identity__copy {
  min-width: 0;
  flex: 1;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.profile-name-row h1 {
  margin: 0;
  color: #191c20;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -0.5px;
}

.profile-name-row svg {
  color: #a5abb4;
}

.profile-badges {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 3px;
}

.level-badge {
  display: inline-flex;
  height: 20px;
  align-items: center;
  gap: 3px;
  padding: 0 6px;
  border-radius: 4px;
  color: #fff;
  background: linear-gradient(100deg, #2a2c31, #17191d);
  font-size: 8px;
  font-weight: 700;
}

.level-badge svg {
  color: var(--yellow);
}

.city-badge {
  display: inline-flex;
  height: 20px;
  align-items: center;
  gap: 2px;
  padding: 0 6px;
  border-radius: 4px;
  color: #6d747e;
  background: #f2f3f5;
  font-size: 8px;
}

.profile-identity__copy p {
  margin: 4px 0 0;
  color: #a0a6af;
  font-size: 8px;
}

.profile-level {
  display: flex;
  width: 44px;
  flex: none;
  flex-direction: column;
  align-items: center;
  padding: 5px 0 4px;
  border: 1px solid #f0f1f3;
  border-radius: 9px;
  color: #4b515a;
  background: #fbfcfc;
  cursor: pointer;
}

.profile-level__star {
  display: inline-flex;
  color: #e8b400;
}

.profile-level b {
  margin-top: 1px;
  font-family: var(--font-numeric);
  font-size: 12px;
  font-weight: 800;
}

.profile-level small {
  color: #a0a6af;
  font-size: 7px;
}

.profile-body {
  margin-top: -25px;
  padding: 0 14px 84px;
}

.profile-income-card {
  position: relative;
  padding: 13px 14px 11px;
  overflow: hidden;
  border-radius: 15px;
  color: #fff;
  background:
    radial-gradient(circle at 86% 4%, rgba(255, 255, 255, 0.25), transparent 34%),
    linear-gradient(130deg, #ffd100, #ffc100 59%, #ffb800);
  box-shadow: 0 9px 23px rgba(219, 174, 0, 0.19);
}

.profile-income-card::after {
  content: "";
  position: absolute;
  right: -66px;
  bottom: -86px;
  width: 190px;
  height: 190px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
}

.profile-income-card__top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(49, 43, 13, 0.58);
  font-size: 9px;
}

.profile-income-card__top button {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  border: 0;
  color: rgba(49, 43, 13, 0.62);
  background: transparent;
  font-size: 8px;
  cursor: pointer;
}

.profile-income-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 12px;
  margin-top: 9px;
}

.profile-income-grid button {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 0;
  border: 0;
  color: #29240e;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.profile-income-grid span {
  color: rgba(49, 43, 13, 0.62);
  font-size: 9px;
  font-weight: 600;
}

.profile-income-grid b {
  margin-top: 2px;
  color: #1c1a0e;
  font-family: var(--font-numeric);
  font-size: 32px;
  font-weight: 850;
  line-height: 1.08;
  letter-spacing: -1.2px;
}

.profile-income-grid small {
  margin-top: 3px;
  color: rgba(49, 43, 13, 0.49);
  font-size: 8px;
}

.profile-income-links {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 30px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(49, 43, 13, 0.13);
}

.profile-income-links button {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  padding: 0;
  border: 0;
  color: #302a10;
  background: transparent;
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
}

.appeal-button {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 30px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 9px;
  border: 0;
  border-radius: 7px;
  color: #524712;
  background: rgba(255, 255, 255, 0.32);
  font-size: 9px;
  font-weight: 650;
  cursor: pointer;
}

.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1.38fr;
  gap: 8px;
  margin-top: 10px;
}

.quick-card {
  position: relative;
  display: flex;
  min-height: 79px;
  flex-direction: column;
  align-items: flex-start;
  padding: 11px;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: #fff;
  box-shadow: var(--shadow-card);
  text-align: left;
  cursor: pointer;
}

.quick-card__label {
  color: #3c424a;
  font-size: 12px;
  font-weight: 750;
}

.quick-card strong {
  margin-top: 8px;
  color: #1f2329;
  font-family: var(--font-numeric);
  font-size: 23px;
  font-weight: 850;
  line-height: 1;
}

.quick-card strong small {
  margin-left: 3px;
  color: #969ca6;
  font-family: var(--font-sans);
  font-size: 8px;
  font-weight: 500;
}

.quick-card__badge {
  margin-top: 5px;
  padding: 2px 6px;
  border-radius: 8px;
  color: #27230f;
  background: var(--yellow);
  font-size: 8px;
}

.quick-card--gift {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #fff;
}

.quick-card__date {
  display: block;
  margin-top: 8px;
  color: #8c939d;
  font-family: var(--font-numeric);
  font-size: 9px;
  font-weight: 500;
}

.quick-card__sub {
  display: block;
  margin-top: 4px;
  color: #d09900;
  font-size: 8px;
}

.gift-art {
  position: relative;
  width: 55px;
  height: 52px;
  flex: none;
  margin-right: -2px;
}

.gift-art__box {
  position: absolute;
  right: 4px;
  bottom: 3px;
  width: 40px;
  height: 31px;
  border-radius: 4px;
  background: linear-gradient(135deg, #ff6768, #f33f56);
  box-shadow: inset 0 -4px 0 rgba(173, 23, 54, 0.16);
}

.gift-art__box::before {
  content: "";
  position: absolute;
  top: -7px;
  left: -4px;
  width: 48px;
  height: 12px;
  border-radius: 3px;
  background: #ff8a82;
}

.gift-art__ribbon {
  position: absolute;
  right: 21px;
  bottom: 3px;
  width: 8px;
  height: 38px;
  background: #ffe15c;
  box-shadow: 0 0 0 1px rgba(191, 136, 0, 0.12);
}

.gift-art__ribbon::before,
.gift-art__ribbon::after {
  content: "";
  position: absolute;
  top: -10px;
  width: 13px;
  height: 10px;
  border: 3px solid #ffe15c;
  border-radius: 50%;
}

.gift-art__ribbon::before {
  left: -11px;
  transform: rotate(-25deg);
}

.gift-art__ribbon::after {
  right: -11px;
  transform: rotate(25deg);
}

.gift-art__spark {
  position: absolute;
  top: 1px;
  right: 0;
  color: #ffd100;
  font-size: 12px;
}

.profile-section {
  margin-top: 12px;
  padding: 13px 13px 11px;
  border-radius: 13px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.profile-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.profile-section__head h2 {
  margin: 0;
  color: #2a2f36;
  font-size: 15px;
  font-weight: 850;
}

.profile-section__head button {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  border: 0;
  color: #969ca6;
  background: transparent;
  font-size: 9px;
  cursor: pointer;
}

.reward-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  margin-top: 10px;
}

.reward-card {
  display: flex;
  min-height: 112px;
  flex-direction: column;
  align-items: flex-start;
  padding: 9px;
  overflow: hidden;
  border: 1px solid #f0b25e;
  border-radius: 10px;
  background:
    linear-gradient(180deg, #ff8a00 0, #ff8a00 27px, transparent 27px),
    #fff;
  text-align: left;
  cursor: pointer;
}

.reward-card__period {
  color: rgba(255, 255, 255, 0.9);
  font-size: 8px;
  font-weight: 650;
}

.reward-card b {
  margin-top: 9px;
  color: #3b3f45;
  font-size: 11px;
  font-weight: 750;
  line-height: 1.4;
}

.reward-card__progress {
  margin-top: 6px;
  color: #f07d00;
  font-size: 8px;
}

.reward-card__bar {
  width: 100%;
  height: 4px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 2px;
  background: #f3f4f6;
}

.reward-card__bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #ff9c2e;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px 4px;
  margin-top: 12px;
}

.plan-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 0 6px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #6b727c;
  font-size: 8px;
  cursor: pointer;
}

.plan-item:active {
  background: #fafbfc;
}

.plan-glyph {
  font-family: "STKaiti", "KaiTi", var(--font-sans);
  font-size: 29px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -2px;
}

.essential-list {
  margin-top: 7px;
}

.essential-item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 9px 0;
  border: 0;
  border-bottom: 1px solid #f2f3f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.essential-item:last-child {
  border-bottom: 0;
  padding-bottom: 1px;
}

.essential-item__icon {
  display: inline-flex;
  width: 33px;
  height: 33px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: #59616c;
  background: #f3f5f6;
}

.essential-item__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.essential-item__copy b {
  color: #3d434b;
  font-size: 11px;
  font-weight: 650;
}

.essential-item__copy span {
  margin-top: 1px;
  color: #9ca2ab;
  font-size: 8px;
}

.essential-item>svg {
  color: #b0b5bd;
}

.profile-version {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 20px 0 6px;
  color: #a8adb5;
  font-size: 8px;
}

.service-fab {
  position: sticky;
  bottom: 10px;
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 5px;
  margin: 11px auto 0;
  padding: 9px 17px;
  border: 1px solid #e9ebee;
  border-radius: 20px;
  color: #3e444c;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 5px 18px rgba(24, 29, 34, 0.1);
  font-size: 10px;
  font-weight: 650;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.service-list button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border: 1px solid #eef0f2;
  border-radius: 10px;
  background: #fafbfc;
  text-align: left;
  cursor: pointer;
}

.service-list__icon {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  color: #4c535c;
  background: #f0f2f4;
}

.service-list button>span:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1px;
}

.service-list b {
  color: #3e444c;
  font-size: 11px;
  font-weight: 650;
}

.service-list small {
  color: #9ca2ab;
  font-size: 8px;
}

.service-list button>svg {
  color: #b0b5bd;
}

.simple-modal {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px;
  border-radius: 10px;
  color: #7a818b;
  background: #f6f7f8;
  font-size: 11px;
  line-height: 1.6;
}

.simple-modal svg {
  flex: none;
  color: #d3a200;
}

.simple-modal p {
  margin: 0;
}

.plan-modal {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px;
  border-radius: 11px;
  background: #f8f9fa;
}

.plan-modal__glyph {
  display: inline-flex;
  width: 48px;
  height: 48px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #fff;
  font-family: "STKaiti", "KaiTi", var(--font-sans);
  font-size: 32px;
  box-shadow: 0 3px 10px rgba(24, 28, 33, 0.06);
}

.plan-modal b {
  color: #393f47;
  font-size: 13px;
}

.plan-modal p {
  margin: 4px 0 0;
  color: #8b929c;
  font-size: 10px;
  line-height: 1.6;
}

.reward-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reward-detail__period {
  color: #f07d00;
  font-size: 9px;
  font-weight: 650;
}

.reward-detail__bar {
  height: 6px;
  overflow: hidden;
  border-radius: 3px;
  background: #f1f2f4;
}

.reward-detail__bar i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #ff9c2e;
}

.reward-detail__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #8c929c;
  font-size: 10px;
}

.reward-detail__row b {
  color: #424850;
  font-weight: 650;
}

.sign-card {
  padding: 14px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 95% 10%, rgba(255, 209, 0, 0.22), transparent 36%),
    #fffaf0;
}

.sign-card__day {
  display: inline-flex;
  height: 20px;
  align-items: center;
  padding: 0 7px;
  border-radius: 4px;
  color: #8b6500;
  background: #ffedb2;
  font-family: var(--font-numeric);
  font-size: 9px;
  font-weight: 800;
}

.sign-card b {
  display: block;
  margin-top: 10px;
  color: #3d3421;
  font-size: 14px;
  font-weight: 750;
}

.sign-card p {
  margin: 5px 0 12px;
  color: #9d8c65;
  font-size: 10px;
  line-height: 1.55;
}

.sign-days {
  display: flex;
  gap: 5px;
}

.sign-days span {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #b8a981;
  background: #f5eddc;
  font-size: 10px;
}

.sign-days span.is-done {
  color: #8d6a00;
  background: #ffedb2;
}

.sign-days span.is-today {
  border: 1px solid #ffd34d;
  color: #8d6a00;
  background: #fff;
}

@media (max-width: 360px) {
  .profile-header {
    padding-right: 12px;
    padding-left: 12px;
  }

  .profile-body {
    padding-right: 12px;
    padding-left: 12px;
  }

  .profile-income-grid b {
    font-size: 28px;
  }
}
</style>
