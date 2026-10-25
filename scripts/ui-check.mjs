import { chromium } from 'playwright-core'
import path from 'node:path'

const executablePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await chromium.launch({ executablePath, headless: true })
const context = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 1,
  locale: 'zh-CN',
  timezoneId: 'Asia/Shanghai',
  colorScheme: 'light',
  reducedMotion: 'reduce',
})
const page = await context.newPage()
const errors = []
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`[console] ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`[pageerror] ${error.message}`))

await page.goto('http://127.0.0.1:5173/#/home', { waitUntil: 'networkidle' })
await page.waitForTimeout(700)

const metrics = await page.evaluate(() => {
  const rect = (selector) => {
    const element = document.querySelector(selector)
    if (!element) return null
    const r = element.getBoundingClientRect()
    return { x: Math.round(r.x), width: Math.round(r.width), right: Math.round(r.right) }
  }
  return {
    innerWidth: window.innerWidth,
    outerWidth: window.outerWidth,
    devicePixelRatio: window.devicePixelRatio,
    bodyScrollWidth: document.body.scrollWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    viewport: rect('.app-viewport'),
    phone: rect('.phone-frame'),
    homeHeader: rect('.home-header'),
    orderCard: rect('.order-card'),
    bottomNav: rect('.bottom-nav'),
    lastNav: rect('.bottom-nav__item:last-child'),
    dock: rect('.home-dock'),
    onlineButton: rect('.dock-online'),
  }
})
console.log(JSON.stringify(metrics, null, 2))
await page.screenshot({ path: path.resolve('screenshots/home-playwright.png') })
console.log('errors:', errors)
await browser.close()

