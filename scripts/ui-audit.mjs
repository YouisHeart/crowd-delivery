import { chromium } from 'playwright-core'
import path from 'node:path'
import fs from 'node:fs'

const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const screenshots = path.resolve('screenshots')
fs.mkdirSync(screenshots, { recursive: true })

const routes = [
  ['home', '/#/home'],
  ['hall', '/#/hall'],
  ['tasks', '/#/tasks'],
  ['route', '/#/route'],
  ['earnings', '/#/earnings'],
  ['profile', '/#/profile'],
  ['settings', '/#/settings'],
  ['detail-accepted', '/#/orders/NJ2026102504'],
  ['detail-picked', '/#/orders/NJ2026102505'],
  ['result', '/#/orders/NJ2026102501/result/delivered'],
]

const viewports = [
  { name: 'small-360', width: 360, height: 800, shot: false },
  { name: 'mobile-390', width: 390, height: 844, shot: true },
  { name: 'desktop-1440', width: 1440, height: 1000, shot: false },
]

const browser = await chromium.launch({ executablePath, headless: true })
const report = { viewports: [], errors: [] }

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    locale: 'zh-CN',
    timezoneId: 'Asia/Shanghai',
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  const localErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') localErrors.push(`[console] ${message.text()}`)
  })
  page.on('pageerror', (error) => localErrors.push(`[pageerror] ${error.message}`))

  const rows = []
  for (const [name, hash] of routes) {
    await page.goto(`http://127.0.0.1:5173${hash}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)
    const metrics = await page.evaluate(() => {
      const phone = document.querySelector('.phone-frame')?.getBoundingClientRect()
      const content = document.querySelector('.app-content')
      const interactive = [...document.querySelectorAll('button, a')].filter((el) => {
        const rect = el.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth
      }).length
      return {
        innerWidth: window.innerWidth,
        phoneWidth: Math.round(phone?.width || 0),
        phoneX: Math.round(phone?.x || 0),
        bodyScrollWidth: document.body.scrollWidth,
        contentScrollWidth: content?.scrollWidth || 0,
        contentClientWidth: content?.clientWidth || 0,
        contentScrollHeight: content?.scrollHeight || 0,
        contentClientHeight: content?.clientHeight || 0,
        visibleInteractive: interactive,
        title: document.title,
      }
    })
    const overflow = metrics.bodyScrollWidth > metrics.innerWidth + 1 ||
      metrics.contentScrollWidth > metrics.contentClientWidth + 1
    rows.push({ name, overflow, ...metrics })
    if (viewport.shot && ['home', 'hall', 'profile', 'detail-accepted'].includes(name)) {
      await page.screenshot({ path: path.join(screenshots, `${viewport.name}-${name}.png`) })
    }
  }
  const failures = rows.filter((row) => row.overflow)
  const errors = [...new Set(localErrors)]
  report.viewports.push({ name: viewport.name, rows, failures, errors })
  if (errors.length) report.errors.push({ viewport: viewport.name, errors })
  await context.close()
}

console.log(JSON.stringify(report, null, 2))
await browser.close()

