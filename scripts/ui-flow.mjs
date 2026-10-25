import { chromium } from 'playwright-core'
import path from 'node:path'
import fs from 'node:fs'

const executablePath =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const screenshots = path.resolve('screenshots')
fs.mkdirSync(screenshots, { recursive: true })

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
const steps = []

page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`[console] ${message.text()}`)
})
page.on('pageerror', (error) => errors.push(`[pageerror] ${error.message}`))

async function shot(name) {
  await page.waitForTimeout(350)
  await page.screenshot({ path: path.join(screenshots, `${name}.png`) })
  steps.push(`${name}: ${page.url().replace('http://127.0.0.1:5173', '')}`)
}

try {
  await page.goto('http://127.0.0.1:5173/#/home', { waitUntil: 'networkidle' })
  await page.waitForTimeout(700)
  await shot('01-home-offline')

  await page.getByTestId('online-toggle').click()
  await page.waitForTimeout(400)
  const onlineText = await page.getByTestId('online-toggle').innerText()
  if (!onlineText.includes('上线中')) throw new Error(`online toggle failed: ${onlineText}`)
  await shot('02-home-online')

  await page.getByTestId('order-action-NJ2026102501').click()
  await page.getByTestId('modal-confirm').waitFor({ state: 'visible' })
  await page.waitForTimeout(200)
  await shot('03-grab-modal')

  await page.getByTestId('modal-confirm').click()
  await page.waitForURL('**/#/orders/NJ2026102501', { timeout: 5000 })
  await page.waitForTimeout(500)
  await shot('04-order-detail-accepted')

  await page.getByTestId('detail-primary').click()
  await page.waitForTimeout(500)
  const pickedText = await page.getByTestId('detail-primary').innerText()
  if (!pickedText.includes('确认送达')) throw new Error(`pickup flow failed: ${pickedText}`)
  await shot('05-order-detail-picked')

  await page.getByTestId('detail-primary').click()
  await page.waitForURL('**/#/orders/NJ2026102501/result/delivered', { timeout: 5000 })
  await page.waitForTimeout(500)
  await shot('06-result-delivered')

  await page.getByTestId('result-home').click()
  await page.waitForURL('**/#/home', { timeout: 5000 })
  await page.waitForTimeout(500)

  await page.getByTestId('bottomnav-hall').click()
  await page.waitForURL('**/#/hall', { timeout: 5000 })
  await page.waitForTimeout(500)
  await shot('07-hall')

  await page.getByTestId('hall-filter').click()
  await page.waitForTimeout(300)
  await shot('08-hall-filter')
  await page.getByTestId('hall-filter-apply').click()
  await page.waitForTimeout(300)

  await page.getByTestId('bottomnav-profile').click()
  await page.waitForURL('**/#/profile', { timeout: 5000 })
  await page.waitForTimeout(500)
  await shot('09-profile')

  await page.locator('.profile-settings').click()
  await page.waitForURL('**/#/settings', { timeout: 5000 })
  await page.waitForTimeout(500)
  await shot('10-settings')

  await page.getByTestId('settings-city').click()
  await page.waitForTimeout(300)
  await page.getByTestId('city-hefei').click()
  await page.waitForTimeout(400)
  const settingsText = await page.locator('.settings-page').innerText()
  if (!settingsText.includes('合肥')) throw new Error('city switch did not reflect in settings')

  await page.locator('.app-header__back').click()
  await page.waitForURL('**/#/profile', { timeout: 5000 })
  await page.waitForTimeout(300)

  await page.getByTestId('bottomnav-route').click()
  await page.waitForURL('**/#/route', { timeout: 5000 })
  await page.waitForTimeout(1200)
  await shot('11-route')

  await page.getByTestId('bottomnav-earnings').click()
  await page.waitForURL('**/#/earnings', { timeout: 5000 })
  await page.waitForTimeout(500)
  await shot('12-earnings')

  await page.getByTestId('bottomnav-home').click()
  await page.waitForURL('**/#/home', { timeout: 5000 })
  await page.waitForTimeout(500)
  const homeText = await page.locator('.home-page').innerText()
  if (!homeText.includes('合肥')) throw new Error('home did not reflect selected city')
  await shot('13-home-hefei')

  console.log(JSON.stringify({ steps, errors, ok: errors.length === 0 }, null, 2))
  if (errors.length) process.exitCode = 1
} catch (error) {
  console.error('FLOW ERROR:', error)
  if (errors.length) console.error('CONSOLE ERRORS:', errors)
  await page.screenshot({ path: path.join(screenshots, 'failure.png') })
  process.exitCode = 1
} finally {
  await browser.close()
}
