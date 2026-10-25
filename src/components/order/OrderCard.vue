<script setup>
import { computed } from 'vue'
import Icon from '../ui/Icon.vue'
import { formatMoney, primaryAction, statusClass, statusText } from '../../utils/format'

const props = defineProps({
  order: { type: Object, required: true },
  showAction: { type: Boolean, default: true },
  compact: { type: Boolean, default: false },
  actionLabel: { type: String, default: '' },
  hideStatus: { type: Boolean, default: false },
  masked: { type: Boolean, default: false },
})

const emit = defineEmits(['open', 'action'])

const label = computed(() => {
  if (props.actionLabel) return props.actionLabel
  return primaryAction(props.order.status)
})

const headline = computed(() => {
  if (props.order.status === 'delivered') return '订单已完成'
  if (props.order.status === 'cancelled') return '订单已取消'
  return `剩余 ${props.order.remainingMin} 分钟（${props.order.deadline}送达）`
})

const routeLabel = computed(() => {
  if (props.order.status === 'available' && props.order.cityId) {
    return props.order.type === '同城' ? '同城单' : '就近单'
  }
  return ''
})

function openCard() {
  emit('open', props.order)
}

function act() {
  emit('action', props.order)
}
</script>

<template>
  <article
    class="order-card"
    :class="[statusClass(order.status), { 'order-card--compact': compact }]"
    :data-testid="`order-card-${order.id}`"
    tabindex="0"
    @click="openCard"
    @keydown.enter="openCard"
  >
    <div class="order-card__top">
      <div class="order-card__headline">
        <span v-if="!hideStatus && order.status !== 'available'" class="order-card__status">
          {{ statusText(order.status) }}
        </span>
        <span class="order-card__remaining">{{ headline }}</span>
      </div>
      <div class="order-card__price">
        <span class="order-card__currency">¥</span>{{ formatMoney(order.fee) }}
      </div>
    </div>

    <div class="order-card__subline">
      <span class="order-type" :class="`order-type--${order.typeKey}`">{{ order.type }}</span>
      <span v-if="routeLabel" class="order-card__route-label">{{ routeLabel }}</span>
      <span v-if="order.bonus" class="order-card__bonus">含奖励 ¥{{ formatMoney(order.bonus) }}</span>
      <span class="order-card__bonus-tip">活动奖励另计</span>
    </div>

    <div class="order-card__tags">
      <span v-for="tag in order.tags" :key="tag" class="micro-tag">
        <span class="micro-tag__dot">◉</span>{{ tag }}
      </span>
    </div>

    <div class="order-card__route">
      <div class="route-rail" aria-hidden="true">
        <span class="route-rail__dot route-rail__dot--pickup" />
        <span class="route-rail__line" />
        <span class="route-rail__dot route-rail__dot--drop" />
      </div>

      <div class="route-points">
        <div class="route-point">
          <div class="route-point__distance">
            <b>{{ order.merchant.distanceKm }}</b><span>km</span>
          </div>
          <div class="route-point__content">
            <div class="route-point__title">{{ order.merchant.name }}</div>
            <div class="route-point__address">{{ order.merchant.address }}</div>
            <div class="route-point__extra">
              <span class="mini-shop">{{ order.merchant.emoji }}</span>
              <span>找店指引</span>
            </div>
          </div>
        </div>

        <div class="route-point route-point--drop">
          <div class="route-point__distance">
            <b>{{ order.customer.distanceKm }}</b><span>km</span>
          </div>
          <div class="route-point__content">
            <div v-if="masked" class="route-point__title route-point__title--masked">
              上线后，才能查看配送地址
            </div>
            <template v-else>
              <div class="route-point__title">{{ order.customer.address }}</div>
              <div class="route-point__customer">
                {{ order.customer.name }} · 尾号 {{ order.customer.tail }}
              </div>
              <div class="order-card__customer-tags">
                <span v-for="tag in order.customer.tags" :key="tag" class="soft-tag">{{ tag }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="order-card__goods">
      <div class="order-card__goods-title">
        <span>货品</span>
        <span class="order-card__goods-meta">{{ order.goods.summary }}</span>
      </div>
      <div class="order-card__goods-line">
        <span>{{ order.goods.items[0]?.name }}</span>
        <span>x{{ order.goods.items[0]?.qty || 1 }}</span>
        <span>¥{{ formatMoney(order.goods.items[0]?.price || order.goods.paid) }}</span>
      </div>
    </div>

    <button
      v-if="showAction"
      class="grab-button"
      :class="{ 'is-secondary': order.status !== 'available', 'is-disabled': order.status === 'cancelled' }"
      type="button"
      :data-testid="`order-action-${order.id}`"
      :disabled="order.status === 'cancelled'"
      @click.stop="act"
    >
      <span class="grab-button__chevron"><Icon name="chevron-right" :size="18" /></span>
      <span>{{ label }}</span>
    </button>
  </article>
</template>

<style scoped>
.order-card {
  position: relative;
  padding: 15px 15px 14px;
  border: 1px solid rgba(20, 24, 28, 0.055);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(26, 30, 36, 0.045);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.order-card:active {
  transform: scale(0.994);
}
.order-card--compact {
  padding: 13px;
}
.order-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.order-card__headline {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  padding-top: 2px;
  color: #2b3037;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.45;
}
.order-card__remaining {
  color: #4f5660;
}
.order-card__status {
  padding: 2px 6px;
  border-radius: 5px;
  color: #fff;
  background: #ff7a00;
  font-size: 10px;
  font-weight: 800;
}
.order-card.is-picked .order-card__status {
  background: #00b578;
}
.order-card.is-delivered .order-card__status {
  background: #6b7280;
}
.order-card.is-cancelled .order-card__status {
  background: #9aa0a9;
}
.order-card__price {
  flex: none;
  color: var(--red);
  font-family: var(--font-numeric);
  font-size: 27px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -1px;
}
.order-card__currency {
  margin-right: 1px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
}
.order-card__subline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin-top: 7px;
  font-size: 11px;
}
.order-type {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 6px;
  border-radius: 5px;
  color: #fff;
  background: #ff3b30;
  font-size: 10px;
  font-weight: 750;
}
.order-type--errand {
  color: #4e6bff;
  background: #edf1ff;
}
.order-type--city {
  color: #a87300;
  background: #fff4d6;
}
.order-card__route-label {
  color: #8c929c;
}
.order-card__bonus {
  color: #ff5c4c;
  font-weight: 650;
}
.order-card__bonus-tip {
  margin-left: auto;
  color: #9aa0aa;
  font-size: 10px;
}
.order-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
}
.micro-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 4px;
  color: #f25645;
  background: #fff3f1;
  font-size: 10px;
  font-weight: 600;
}
.micro-tag__dot {
  font-size: 7px;
  line-height: 1;
}
.order-card__route {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.route-rail {
  display: flex;
  width: 13px;
  flex: none;
  flex-direction: column;
  align-items: center;
  padding-top: 7px;
}
.route-rail__dot {
  display: block;
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: #22262c;
}
.route-rail__dot--drop {
  background: #00b578;
}
.route-rail__line {
  width: 1px;
  flex: 1;
  min-height: 38px;
  margin: 4px 0;
  background: linear-gradient(#d8dbe0, #d8dbe0 60%, transparent);
}
.route-points {
  min-width: 0;
  flex: 1;
}
.route-point {
  display: flex;
  gap: 7px;
  padding-bottom: 15px;
}
.route-point--drop {
  padding-bottom: 0;
}
.route-point__distance {
  width: 30px;
  flex: none;
  padding-top: 1px;
  color: #7e8590;
  font-size: 9px;
  line-height: 1.15;
  text-align: right;
}
.route-point__distance b {
  display: block;
  color: #2a2e35;
  font-family: var(--font-numeric);
  font-size: 14px;
  font-weight: 750;
}
.route-point__content {
  min-width: 0;
  flex: 1;
}
.route-point__title {
  overflow: hidden;
  color: #1f2329;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.route-point--drop .route-point__title {
  font-size: 16px;
}
.route-point__title--masked {
  color: #7f8691;
  font-size: 15px !important;
  font-weight: 600;
  letter-spacing: 0;
}
.route-point__address {
  margin-top: 3px;
  overflow: hidden;
  color: #8d939d;
  font-size: 12px;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.route-point__extra {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 25px;
  margin-top: 6px;
  padding: 0 7px 0 4px;
  border: 1px solid #e7e9ed;
  border-radius: 6px;
  color: #525861;
  font-size: 10px;
}
.mini-shop {
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f7f8f9;
  font-size: 11px;
}
.route-point__customer {
  margin-top: 2px;
  color: #9aa0a9;
  font-size: 11px;
}
.order-card__customer-tags {
  display: flex;
  gap: 4px;
  margin-top: 5px;
}
.soft-tag {
  padding: 2px 5px;
  border: 1px solid #e8eaee;
  border-radius: 4px;
  color: #727985;
  font-size: 9px;
}
.order-card__goods {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f2f4;
}
.order-card__goods-title {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #2c3138;
  font-size: 12px;
  font-weight: 700;
}
.order-card__goods-meta {
  overflow: hidden;
  color: #8d939d;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.order-card__goods-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  color: #5f6570;
  font-size: 11px;
}
.order-card__goods-line span:first-child {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.order-card__goods-line span:nth-child(2) {
  color: #969ca6;
}
.order-card__goods-line span:last-child {
  min-width: 40px;
  color: #30353d;
  text-align: right;
}
.grab-button {
  display: flex;
  width: 100%;
  height: 44px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 13px;
  border: 0;
  border-radius: 10px;
  color: #1b1d21;
  background: var(--yellow);
  box-shadow: 0 5px 14px rgba(255, 208, 0, 0.2);
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.16s ease, filter 0.16s ease;
}
.grab-button:active {
  transform: scale(0.99);
  filter: brightness(0.97);
}
.grab-button.is-secondary {
  color: #fff;
  background: #17191d;
  box-shadow: none;
}
.grab-button.is-disabled {
  color: #9ca2ab;
  background: #f1f2f4;
  box-shadow: none;
  cursor: default;
}
.grab-button__chevron {
  display: inline-flex;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(27, 29, 33, 0.25);
  border-radius: 50%;
}
.is-secondary .grab-button__chevron {
  border-color: rgba(255, 255, 255, 0.32);
}
@media (max-width: 360px) {
  .order-card__price {
    font-size: 24px;
  }
  .route-point__title {
    font-size: 15px;
  }
}
</style>
