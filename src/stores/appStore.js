import { computed, reactive, watch } from 'vue'
import cityData from '../data/cities.json'
import orderData from '../data/orders.json'
import profileData from '../data/profile.json'
import { dateKey } from '../utils/format'

const STORAGE_KEY = 'mtzb-learning-demo-v1'

export const cities = cityData.cities
export const profile = profileData

const bootAt = Date.now()

function clockLabel(timestamp) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))
}

// 以本次打开的时间为基准生成送达时限，避免静态数据出现
// “19:30 仍显示 15:16 前送达”的穿帮。
const runtimeOrders = orderData.map((order) => {
  const remainingMin = Math.max(1, Number(order.remainingMin) || 30)
  const deadlineAt = bootAt + remainingMin * 60_000
  return {
    ...order,
    deadlineAt,
    remainingMin,
    deadline: `${clockLabel(deadlineAt)}前`,
    bonusLabel:
      Number(order.bonus) > 0
        ? `${clockLabel(deadlineAt - 60_000)}前送达，再奖 ¥${Number(order.bonus).toFixed(1)}`
        : order.bonusLabel,
  }
})

export const orders = reactive(runtimeOrders)

const defaultState = {
  online: false,
  cityId: cityData.defaultCityId,
  orderStates: {},
  acceptedAt: {},
  deliveredIncome: 0,
  deliveredCount: 0,
  readNotificationIds: [],
  signInDate: '',
  settings: {
    autoAccept: false,
    voiceReminder: true,
    weatherReminder: true,
    keepScreenOn: true,
  },
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaultState)
    const saved = JSON.parse(raw)
    return {
      ...structuredClone(defaultState),
      ...saved,
      settings: { ...defaultState.settings, ...(saved.settings || {}) },
      orderStates: saved.orderStates || {},
      acceptedAt: saved.acceptedAt || {},
      readNotificationIds: Array.isArray(saved.readNotificationIds)
        ? saved.readNotificationIds
        : [],
    }
  } catch {
    return structuredClone(defaultState)
  }
}

export const appState = reactive(loadState())

export const currentCity = computed(
  () => cities.find((city) => city.id === appState.cityId) || cities[0],
)

export function effectiveStatus(order) {
  return appState.orderStates[order.id] || order.status
}

export function withStatus(order) {
  return { ...order, status: effectiveStatus(order) }
}

export const cityOrders = computed(() =>
  orders.filter((order) => order.cityId === appState.cityId).map(withStatus),
)

export const availableOrders = computed(() =>
  cityOrders.value.filter((order) => order.status === 'available'),
)

export const acceptedOrders = computed(() =>
  cityOrders.value.filter((order) => order.status === 'accepted'),
)

export const pickedOrders = computed(() =>
  cityOrders.value.filter((order) => order.status === 'picked'),
)

export const activeOrders = computed(() => [
  ...acceptedOrders.value,
  ...pickedOrders.value,
])

export const completedOrders = computed(() =>
  cityOrders.value.filter((order) => order.status === 'delivered'),
)

export const cancelledOrders = computed(() =>
  cityOrders.value.filter((order) => order.status === 'cancelled'),
)

export const todayStats = computed(() => ({
  ...profile.today,
  income: Number((profile.today.income + appState.deliveredIncome).toFixed(1)),
  orders: profile.today.orders + appState.deliveredCount,
}))

export const unreadNotifications = computed(
  () => profile.notifications.filter((item) => !appState.readNotificationIds.includes(item.id))
    .length,
)

export const signedInToday = computed(() => appState.signInDate === dateKey())

export function getOrderById(id) {
  const order = orders.find((item) => item.id === id)
  return order ? withStatus(order) : null
}

function refreshOrderTimers() {
  const now = Date.now()
  orders.forEach((order) => {
    if (['delivered', 'cancelled'].includes(effectiveStatus(order))) return
    order.remainingMin = Math.max(1, Math.ceil((order.deadlineAt - now) / 60_000))
    order.deadline = `${clockLabel(order.deadlineAt)}前`
    if (Number(order.bonus) > 0) {
      order.bonusLabel = `${clockLabel(order.deadlineAt - 60_000)}前送达，再奖 ¥${Number(order.bonus).toFixed(1)}`
    }
  })
}

let orderClockTimer = null
if (typeof window !== 'undefined') {
  refreshOrderTimers()
  orderClockTimer = window.setInterval(refreshOrderTimers, 30_000)
  if (import.meta.hot) {
    import.meta.hot.dispose(() => window.clearInterval(orderClockTimer))
  }
}

export function setCity(cityId) {
  if (!cities.some((city) => city.id === cityId)) return
  appState.cityId = cityId
  const city = cities.find((item) => item.id === cityId)
  pushToast(`工作城市已切换为 ${city.name}`)
}

export function setOnline(value) {
  const next = typeof value === 'boolean' ? value : !appState.online
  appState.online = next
  pushToast(next ? '已上线，开始接收订单' : '已下线，不再接收订单', next ? 'success' : 'default')
}

export function grabOrder(id) {
  const order = getOrderById(id)
  if (!order || order.status !== 'available') return false
  if (!appState.online) {
    pushToast('当前为下线状态，请先上线', 'warning')
    return false
  }
  appState.orderStates[id] = 'accepted'
  appState.acceptedAt[id] = new Date().toISOString()
  pushToast('抢单成功，请在待取货中查看', 'success')
  return true
}

export function pickupOrder(id) {
  const order = getOrderById(id)
  if (!order || order.status !== 'accepted') return false
  appState.orderStates[id] = 'picked'
  pushToast('已确认取货，开始配送', 'success')
  return true
}

export function deliverOrder(id) {
  const order = getOrderById(id)
  if (!order || order.status !== 'picked') return false
  appState.orderStates[id] = 'delivered'
  appState.deliveredIncome = Number((appState.deliveredIncome + order.fee).toFixed(2))
  appState.deliveredCount += 1
  pushToast('送达成功，订单收入已计入账户', 'success')
  return true
}

export function cancelOrder(id) {
  const order = getOrderById(id)
  if (!order) return false
  appState.orderStates[id] = 'cancelled'
  pushToast('订单已取消（）', 'default')
  return true
}

export function transferOrder(id) {
  const order = getOrderById(id)
  if (!order) return false
  appState.orderStates[id] = 'available'
  delete appState.acceptedAt[id]
  pushToast('转单已发布，订单已回到大厅', 'success')
  return true
}

export function markNotificationsRead() {
  appState.readNotificationIds = profile.notifications.map((item) => item.id)
}

export function dismissNotification(id) {
  if (!appState.readNotificationIds.includes(id)) {
    appState.readNotificationIds.push(id)
  }
}

export function setSetting(key, value) {
  appState.settings[key] = value
}

export function signInToday() {
  appState.signInDate = dateKey()
}

export function resetDemo() {
  const fresh = structuredClone(defaultState)
  Object.assign(appState, fresh)
  window.localStorage.removeItem(STORAGE_KEY)
  pushToast('数据已重置', 'success')
}

export function pushToast(message, type = 'default') {
  appState.toast = {
    id: Date.now() + Math.random(),
    message,
    type,
  }
  window.clearTimeout(pushToast.timer)
  pushToast.timer = window.setTimeout(() => {
    appState.toast = null
  }, 2200)
}

watch(
  () => ({
    online: appState.online,
    cityId: appState.cityId,
    orderStates: appState.orderStates,
    acceptedAt: appState.acceptedAt,
    deliveredIncome: appState.deliveredIncome,
    deliveredCount: appState.deliveredCount,
    readNotificationIds: appState.readNotificationIds,
    signInDate: appState.signInDate,
    settings: appState.settings,
  }),
  (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // 应用在没有本地存储能力时仍然可以正常运行。
    }
  },
  { deep: true },
)
