<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import AppModal from '../components/ui/AppModal.vue'
import BottomSheet from '../components/ui/BottomSheet.vue'
import Icon from '../components/ui/Icon.vue'
import RiderAvatar from '../components/ui/RiderAvatar.vue'
import SettingsRow from '../components/ui/SettingsRow.vue'
import ToggleSwitch from '../components/ui/ToggleSwitch.vue'
import {
  appState,
  cities,
  currentCity,
  profile,
  pushToast,
  resetDemo,
  setCity,
  setSetting,
} from '../stores/appStore'

const router = useRouter()
const cityOpen = ref(false)
const policyOpen = ref(false)
const aboutOpen = ref(false)
const resetOpen = ref(false)
const logoutOpen = ref(false)
const profileOpen = ref(false)
const feedbackOpen = ref(false)
const genericOpen = ref(false)
const feedbackText = ref('')
const genericTitle = ref('')
const genericText = ref('')

const policyTitle = computed(() => genericTitle.value)
const appVersion = '1.0.0'

function toggle(key, value) {
  setSetting(key, value)
}

function chooseCity(city) {
  setCity(city.id)
  cityOpen.value = false
}

function clearCache() {
  window.localStorage.removeItem('mtzb-demo-cache')
  pushToast('本地缓存已清理', 'success')
}

function openGeneric(title, text) {
  genericTitle.value = title
  genericText.value = text
  genericOpen.value = true
}

function openPolicy(title) {
  genericTitle.value = title
  genericText.value =
    title === '隐私政策'
      ? '仅使用浏览器本地存储保存在线状态、城市选择、订单状态和界面设置。\n\n不会采集位置、通讯录、相机、麦克风、设备标识或任何真实骑手账号信息，也不会向服务器上传数据。\n\n所有商家、顾客、地址和收益均为虚构数据。'
      : '本应用是独立开发的界面样例，与狗团官方无关。\n\n页面中的接单、取货、送达、转单、收益等流程均为本地，不构成真实的配送服务协议、劳动合作关系或支付承诺。\n\n请勿将本用于冒充官方应用或从事任何真实业务。'
  policyOpen.value = true
}

function submitFeedback() {
  if (!feedbackText.value.trim()) {
    pushToast('请先填写反馈内容', 'warning')
    return
  }
  feedbackOpen.value = false
  feedbackText.value = ''
  pushToast('反馈已记录到本地环境', 'success')
}

function confirmReset() {
  resetOpen.value = false
  resetDemo()
  router.push('/home')
}

function confirmLogout() {
  logoutOpen.value = false
  pushToast('环境没有真实登录态，已返回工作台')
  router.push('/home')
}
</script>

<template>
  <div class="settings-page">
    <AppHeader title="设置" subtitle="配置信息" back="/profile" border />

    <div class="settings-body">
      <button class="identity-card" type="button" @click="profileOpen = true">
        <RiderAvatar :size="50" />
        <span class="identity-card__copy">
          <b>{{ profile.user.displayName }} <em>身份</em></b>
          <span>登录手机号：{{ profile.user.phoneMask }}</span>
          <span>呼叫手机号：{{ profile.user.phoneMask }}</span>
        </span>
        <Icon name="chevron-right" :size="16" />
      </button>

      <section class="settings-group">
        <div class="settings-group__title">配送辅助设置</div>
        <SettingsRow icon="bike" title="自动接派单" description="中仅保存开关状态，不会自动接单" :chevron="false">
          <template #right>
            <ToggleSwitch :model-value="appState.settings.autoAccept" label="自动接派单"
              @update:model-value="toggle('autoAccept', $event)" />
          </template>
        </SettingsRow>
        <SettingsRow icon="bell" title="语音提醒" description="新订单与状态变化提示音" :chevron="false">
          <template #right>
            <ToggleSwitch :model-value="appState.settings.voiceReminder" label="语音提醒"
              @update:model-value="toggle('voiceReminder', $event)" />
          </template>
        </SettingsRow>
        <SettingsRow icon="info" title="天气提醒" description="展示高温、降雨等安全提示" :chevron="false">
          <template #right>
            <ToggleSwitch :model-value="appState.settings.weatherReminder" label="天气提醒"
              @update:model-value="toggle('weatherReminder', $event)" />
          </template>
        </SettingsRow>
        <SettingsRow icon="spark" title="屏幕常亮" description="配送页保持屏幕点亮" :chevron="false">
          <template #right>
            <ToggleSwitch :model-value="appState.settings.keepScreenOn" label="屏幕常亮"
              @update:model-value="toggle('keepScreenOn', $event)" />
          </template>
        </SettingsRow>
      </section>

      <section class="settings-group">
        <div class="settings-group__title">账号与工作</div>
        <button class="city-setting" type="button" data-testid="settings-city" @click="cityOpen = true">
          <span class="city-setting__icon">
            <Icon name="city" :size="18" />
          </span>
          <span class="city-setting__copy">
            <b>工作城市</b>
            <span>切换后仅展示该城市的订单</span>
          </span>
          <span class="city-setting__value">{{ currentCity.name }} <small>{{ currentCity.province }}</small></span>
          <Icon name="chevron-right" :size="16" />
        </button>
        <SettingsRow icon="location" title="隐私设置" description="顾客地址与手机号在中始终脱敏"
          @click="openGeneric('隐私设置', '环境不会读取真实定位，也不会展示完整顾客手机号。下线时顾客配送地址默认隐藏；所有顾客与地址均为虚构数据。')" />
        <SettingsRow icon="doc" title="清理聊天缓存" description="仅清理用的本地缓存标记" @click="clearCache" />
      </section>

      <section class="settings-group">
        <div class="settings-group__title">服务与支持</div>
        <SettingsRow icon="wallet" title="支付设置" icon-tone="yellow"
          @click="openGeneric('支付设置', '本应用没有真实钱包、银行卡或支付能力。收益页中的金额都是虚构数据，不能提现，也不会产生任何资金交易。')" />
        <SettingsRow icon="headset" title="反馈" description="填写本地反馈" icon-tone="green" @click="feedbackOpen = true" />
        <SettingsRow icon="doc" title="协议规则" @click="openPolicy('协议规则')" />
        <SettingsRow icon="lock" title="隐私政策" @click="openPolicy('隐私政策')" />
        <SettingsRow icon="info" title="关于狗团众包" description="学习版本与免责声明" @click="aboutOpen = true" />
      </section>

      <section class="settings-group">
        <div class="settings-group__title">数据</div>
        <SettingsRow icon="refresh" title="重置数据" description="恢复初始订单、城市与在线状态" data-testid="reset-demo"
          @click="resetOpen = true" />
      </section>

      <section class="settings-group settings-group--danger">
        <SettingsRow icon="user" title="注销骑手身份" description="环境不提供账号注销" danger
          @click="openGeneric('注销骑手身份', '本没有真实骑手身份、实名信息或合同关系，因此没有可注销的真实账号。你可以在上方重置数据。')" />
        <SettingsRow icon="lock" title="注销众包 App 服务" description="环境不提供账号注销" danger
          @click="openGeneric('注销众包 App 服务', '此入口仅用于展示原始设置页的信息结构。应用不连接任何真实服务端，也不存在真实服务注销流程。')" />
      </section>

      <button class="logout-button" type="button" @click="logoutOpen = true">退出登录</button>

      <div class="settings-version">
        <span>狗团众包</span>
        <span>v{{ appVersion }}</span>
      </div>
    </div>

    <BottomSheet v-model="cityOpen" title="选择工作城市" subtitle="南京、合肥、杭州（浙江）">
      <div class="city-list">
        <button v-for="city in cities" :key="city.id" class="city-option"
          :class="{ 'is-active': city.id === appState.cityId }" type="button" :data-testid="`city-${city.id}`"
          @click="chooseCity(city)">
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
      <p class="sheet-note">工作城市只影响本地 JSON 订单的筛选。</p>
    </BottomSheet>

    <BottomSheet v-model="policyOpen" :title="policyTitle" subtitle="学习说明">
      <div class="policy-copy">
        <p v-for="(paragraph, index) in genericText.split('\n\n')" :key="index">{{ paragraph }}</p>
      </div>
    </BottomSheet>

    <BottomSheet v-model="feedbackOpen" title="反馈" subtitle="内容仅保存在当前页面，不会上传">
      <textarea v-model="feedbackText" class="feedback-textarea" rows="4" maxlength="200" placeholder="写下你对这个学习的建议…" />
      <div class="feedback-count">{{ feedbackText.length }}/200</div>
      <template #footer>
        <button class="btn btn--ghost" type="button" @click="feedbackOpen = false">取消</button>
        <button class="btn btn--primary" type="button" @click="submitFeedback">提交反馈</button>
      </template>
    </BottomSheet>

    <AppModal v-model="profileOpen" title="身份" subtitle="所有个人信息请妥善保管" confirm-text="知道了" hide-cancel
      @confirm="profileOpen = false">
      <div class="profile-modal">
        <div><span>姓名</span><b>{{ profile.user.displayName }}</b></div>
        <div><span>骑手编号</span><b>{{ profile.user.riderId }}</b></div>
        <div><span>工作城市</span><b>{{ currentCity.name }} · {{ currentCity.area }}</b></div>
        <div><span>入驻日期</span><b>{{ profile.user.joinedAt }}</b></div>
        <div><span>登录手机</span><b>{{ profile.user.phoneMask }}</b></div>
      </div>
    </AppModal>

    <AppModal v-model="aboutOpen" title="关于狗团众包 · 学习" subtitle="独立开发，与狗团官方无关" confirm-text="我知道了" hide-cancel
      @confirm="aboutOpen = false">
      <div class="about-block">
        <p>这是一个参考公开可见骑手工作台界面、使用 Vue 3 + CSS + 本地 JSON 数据独立重建的 H5 学习。</p>
        <div class="tech-list">
          <span>Vue 3</span><span>Vite</span><span>原生 CSS</span><span>本地 JSON</span>
        </div>
        <p class="about-note">不包含原 APK 的源代码、图片素材或私有资源；不接入真实账号、订单、地图、支付和反作弊系统。</p>
      </div>
    </AppModal>

    <AppModal v-model="genericOpen" :title="genericTitle" confirm-text="我知道了" hide-cancel
      @confirm="genericOpen = false">
      <div class="generic-copy">
        <Icon name="info" :size="22" />
        <p>{{ genericText }}</p>
      </div>
    </AppModal>

    <AppModal v-model="resetOpen" title="重置数据？" subtitle="订单状态、城市、在线状态、收入累计与设置都会恢复初始值。" confirm-text="确认重置"
      confirm-tone="danger" @confirm="confirmReset">
      <div class="reset-tip">
        <Icon name="refresh" :size="18" />
        <span>这个操作不会影响任何真实账号或真实订单。</span>
      </div>
    </AppModal>

    <AppModal v-model="logoutOpen" title="退出登录" subtitle="环境没有真实登录态。" confirm-text="返回工作台" @confirm="confirmLogout">
      <div class="logout-tip">
        <Icon name="info" :size="18" />
        <span>点击后将返回工作台，数据会保留。如需清空，请使用“重置数据”。</span>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100%;
  background: #f4f5f7;
}

.settings-body {
  padding: 12px 14px 26px;
}

.identity-card {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(22, 26, 31, 0.045);
  border-radius: 13px;
  background: #fff;
  box-shadow: var(--shadow-card);
  text-align: left;
  cursor: pointer;
}

.identity-card__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.identity-card__copy b {
  color: #2d3239;
  font-size: 14px;
  font-weight: 750;
}

.identity-card__copy b em {
  margin-left: 4px;
  padding: 1px 4px;
  border-radius: 3px;
  color: #9a7600;
  background: #fff7d9;
  font-size: 7px;
  font-style: normal;
  font-weight: 650;
}

.identity-card__copy span {
  color: #969ca6;
  font-size: 9px;
}

.identity-card>svg {
  flex: none;
  color: #b0b5bd;
}

.settings-group {
  margin-top: 11px;
  padding: 5px 12px;
  border-radius: 13px;
  background: #fff;
  box-shadow: var(--shadow-card);
}

.settings-group__title {
  padding: 8px 2px 4px;
  color: #a1a7b0;
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.4px;
}

.city-setting {
  display: flex;
  width: 100%;
  min-height: 52px;
  align-items: center;
  gap: 9px;
  padding: 9px 2px;
  border: 0;
  border-bottom: 1px solid #f2f3f5;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.city-setting__icon {
  display: inline-flex;
  width: 31px;
  height: 31px;
  flex: none;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #9b7400;
  background: #fff7dc;
}

.city-setting__copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 1px;
}

.city-setting__copy b {
  color: #3d434b;
  font-size: 12px;
  font-weight: 650;
}

.city-setting__copy span {
  color: #9ca2ab;
  font-size: 8px;
}

.city-setting__value {
  flex: none;
  color: #6c737d;
  font-size: 10px;
  font-weight: 650;
}

.city-setting__value small {
  margin-left: 2px;
  color: #a4aab3;
  font-size: 8px;
  font-weight: 500;
}

.city-setting>svg {
  flex: none;
  color: #b6bbc2;
}

.logout-button {
  display: flex;
  width: 100%;
  height: 46px;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  border: 1px solid #f0d6d2;
  border-radius: 11px;
  color: #d84a3f;
  background: #fff;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}

.settings-version {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 19px 0 4px;
  color: #a6acb5;
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

.sheet-note {
  margin: 12px 0 2px;
  color: #a0a6af;
  font-size: 9px;
  text-align: center;
}

.policy-copy p {
  margin: 0 0 12px;
  color: #636a75;
  font-size: 11px;
  line-height: 1.75;
  white-space: pre-line;
}

.policy-copy p:last-child {
  margin-bottom: 0;
}

.feedback-textarea {
  width: 100%;
  resize: none;
  padding: 11px;
  border: 1px solid #e7e9ed;
  border-radius: 9px;
  outline: none;
  color: #454b54;
  background: #fafbfc;
  font-family: inherit;
  font-size: 11px;
  line-height: 1.6;
}

.feedback-textarea:focus {
  border-color: #ffda4b;
  background: #fff;
}

.feedback-count {
  margin-top: 5px;
  color: #a0a6af;
  font-size: 8px;
  text-align: right;
}

.profile-modal {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: #f7f8f9;
}

.profile-modal div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #8c929c;
  font-size: 10px;
}

.profile-modal b {
  color: #454b54;
  font-size: 10px;
  font-weight: 650;
}

.about-block p {
  margin: 0 0 11px;
  color: #5f6671;
  font-size: 11px;
  line-height: 1.7;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 11px;
}

.tech-list span {
  padding: 4px 7px;
  border-radius: 5px;
  color: #7b6a25;
  background: #fff7d9;
  font-size: 8px;
  font-weight: 650;
}

.about-note {
  padding: 9px;
  border-radius: 8px;
  background: #f7f8f9;
  color: #8c929c !important;
}
.generic-copy {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 12px;
  border-radius: 10px;
  color: #707782;
  background: #f7f8f9;
  font-size: 11px;
  line-height: 1.65;
}

.generic-copy svg {
  flex: none;
  color: #c79900;
}

.generic-copy p {
  margin: 0;
}

.reset-tip,
.logout-tip {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  padding: 11px;
  border-radius: 9px;
  color: #7b818b;
  background: #f7f8f9;
  font-size: 10px;
  line-height: 1.6;
}

.reset-tip svg,
.logout-tip svg {
  flex: none;
  color: #b28a00;
}

.logout-tip svg {
  color: #d84a3f;
}
</style>
