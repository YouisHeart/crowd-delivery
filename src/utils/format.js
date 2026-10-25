export function formatMoney(value) {
  const number = Number(value) || 0
  return number % 1 === 0 ? number.toFixed(0) : number.toFixed(1)
}

export function formatPrice(value) {
  const number = Number(value) || 0
  return number.toFixed(2)
}

export function statusText(status) {
  return (
    {
      available: '待抢单',
      accepted: '待取货',
      picked: '配送中',
      delivered: '已完成',
      cancelled: '已取消',
    }[status] || '未知状态'
  )
}

export function statusClass(status) {
  return (
    {
      available: 'is-available',
      accepted: 'is-accepted',
      picked: 'is-picked',
      delivered: 'is-delivered',
      cancelled: 'is-cancelled',
    }[status] || ''
  )
}

export function primaryAction(status) {
  return (
    {
      available: '抢单',
      accepted: '我已取货',
      picked: '确认送达',
      delivered: '查看收入',
      cancelled: '已取消',
    }[status] || '查看详情'
  )
}

export function maskPhoneTail(tail) {
  return tail ? `尾号 ${tail}` : ''
}

export function nowClock() {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function todayLabel() {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date())
}

export function dateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
