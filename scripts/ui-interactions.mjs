import { chromium } from 'playwright-core'

const executablePath =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await chromium.launch({ executablePath, headless: true })
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  reducedMotion: 'reduce',
})
const page = await context.newPage()
const errors = []
const checks = []

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`[console] ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`[pageerror] ${error.message}`))

function check(name, condition, detail = '') {
  checks.push({ name, ok: Boolean(condition), detail })
  if (!condition) throw new Error(`CHECK FAILED: ${name} ${detail}`)
}

try {
  await page.goto('http://127.0.0.1:5173/#/home', { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  // 下线抢单：应弹出上线提示，确认后自动上线并接单。
  await page.getByTestId('order-action-NJ2026102501').click()
  await page.getByTestId('modal-confirm').waitFor({ state: 'visible' })
  check('offline prompt shown', await page.getByText('当前为下线状态').isVisible())
  await page.getByTestId('modal-confirm').click()
  await page.waitForURL('**/#/orders/NJ2026102501', { timeout: 5000 })
  check('offline grab navigates to detail', page.url().includes('/orders/NJ2026102501'))
  check(
    'offline grab updates status',
    (await page.getByTestId('detail-primary').innerText()).includes('我已取货'),
  )

  // 联系与问题反馈均为本地。
  await page.getByRole('button', { name: '联系' }).click()
  await page.waitForTimeout(250)
  check('contact sheet opens', await page.getByText('联系订单相关方').isVisible())
  await page.locator('.sheet-close').click()
  await page.getByRole('button', { name: '遇到问题' }).first().click()
  await page.waitForTimeout(250)
  await page.getByRole('button', { name: '商家出餐慢' }).click()
  await page.getByRole('button', { name: '提交反馈' }).click()
  await page.waitForTimeout(250)
  check('issue feedback closes', !(await page.getByText('提交反馈').isVisible()))

  // 转单后订单回到订单大厅。
  await page.goBack()
  await page.waitForTimeout(300)
  await page.goto('http://127.0.0.1:5173/#/orders/NJ2026102504', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  check('accepted detail shows transfer', await page.getByRole('button', { name: '转单' }).isVisible())
  await page.getByRole('button', { name: '转单' }).click()
  await page.waitForTimeout(200)
  await page.getByTestId('modal-confirm').click()
  await page.waitForTimeout(400)
  await page.goto('http://127.0.0.1:5173/#/hall', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  const hallText = await page.locator('.hall-page').innerText()
  check('transferred order returns to hall', hallText.includes('巷口面馆'))

  // 筛选。
  await page.getByTestId('hall-filter').click()
  await page.waitForTimeout(200)
  const sheet = page.locator('.sheet-panel')
  await sheet.getByRole('button', { name: '跑腿单' }).click()
  await page.getByTestId('hall-filter-apply').click()
  await page.waitForTimeout(300)
  const filteredTypes = await page.locator('.hall-list .order-type').allInnerTexts()
  check(
    'filter applies',
    filteredTypes.length > 0 && filteredTypes.every((type) => type.trim() === '跑腿单'),
  )

  // 签到与设置持久化。
  await page.goto('http://127.0.0.1:5173/#/profile', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  await page.locator('.quick-card--gift').click()
  await page.waitForTimeout(250)
  check('sign-in sheet opens', await page.getByText('专属签到礼').last().isVisible())
  await page.getByRole('button', { name: '立即签到' }).click()
  await page.waitForTimeout(300)
  check('sign-in succeeds', (await page.locator('.quick-card--gift').innerText()).includes('今日已签到'))

  await page.locator('.profile-settings').click()
  await page.waitForURL('**/#/settings', { timeout: 5000 })
  const firstToggle = page.locator('.toggle-switch').first()
  const beforeToggle = await firstToggle.getAttribute('aria-checked')
  await firstToggle.click()
  await page.waitForTimeout(250)
  const afterToggle = await firstToggle.getAttribute('aria-checked')
  check('settings toggle changes', beforeToggle !== afterToggle)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  check(
    'settings toggle persists',
    (await page.locator('.toggle-switch').first().getAttribute('aria-checked')) === afterToggle,
  )

  await page.goto('http://127.0.0.1:5173/#/profile', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  check(
    'sign-in persists after reload',
    (await page.locator('.quick-card--gift').innerText()).includes('今日已签到'),
  )

  // 重置数据。
  await page.locator('.profile-settings').click()
  await page.waitForURL('**/#/settings', { timeout: 5000 })
  await page.getByTestId('reset-demo').click()
  await page.waitForTimeout(200)
  await page.getByTestId('modal-confirm').click()
  await page.waitForURL('**/#/home', { timeout: 5000 })
  await page.waitForTimeout(300)
  const resetHome = await page.locator('.home-page').innerText()
  check('reset returns offline home', resetHome.includes('下线中'))

  // 取消订单后进入已取消结果页。
  await page.goto('http://127.0.0.1:5173/#/orders/NJ2026102504', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: '遇到问题' }).first().click()
  await page.waitForTimeout(250)
  await page.getByRole('button', { name: '取消订单' }).click()
  await page.waitForTimeout(250)
  await page.getByTestId('modal-confirm').click()
  await page.waitForURL('**/result/cancelled', { timeout: 5000 })
  await page.waitForTimeout(300)
  check(
    'cancel flow reaches cancelled result',
    (await page.locator('.result-hero').innerText()).includes('订单已取消'),
  )

  // 结果页评价。
  await page.goto('http://127.0.0.1:5173/#/orders/NJ2026102501/result/delivered', {
    waitUntil: 'networkidle',
  })
  await page.waitForTimeout(300)
  const happyReview = page.locator('.review-button').nth(1)
  await happyReview.click()
  await page.waitForTimeout(250)
  check(
    'result review selects',
    await happyReview.evaluate((el) => el.classList.contains('is-active')),
  )

  const overflow = await page.evaluate(() => {
    const content = document.querySelector('.app-content')
    return content.scrollWidth > content.clientWidth + 1
  })
  check('result page has no horizontal overflow', !overflow)

  console.log(JSON.stringify({ ok: true, checks, errors }, null, 2))
} catch (error) {
  console.error(error)
  console.error(JSON.stringify({ checks, errors }, null, 2))
  process.exitCode = 1
} finally {
  await browser.close()
}

