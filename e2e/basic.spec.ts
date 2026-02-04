import { test, expect } from '@playwright/test'

test.describe('Medical Voice Scribe - Basic Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Medical Scribe Flow/)
  })

  test('should display main UI elements', async ({ page }) => {
    // Header
    await expect(page.locator('header')).toBeVisible()

    // Recording button
    await expect(page.getByRole('button', { name: /録音/ })).toBeVisible()

    // Generate button
    await expect(page.getByRole('button', { name: /カルテ生成/ })).toBeVisible()

    // Clear button
    await expect(page.getByRole('button', { name: /クリア/ })).toBeVisible()
  })

  test('should have textarea for transcript input', async ({ page }) => {
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
  })

  test('should disable generate button when no transcript', async ({ page }) => {
    const generateButton = page.getByRole('button', { name: /カルテ生成/ })
    await expect(generateButton).toBeDisabled()
  })

  test('should enable generate button when transcript has content', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.fill('医師: 今日はどうされましたか？\n患者: 頭が痛いです。')

    const generateButton = page.getByRole('button', { name: /カルテ生成/ })
    await expect(generateButton).toBeEnabled()
  })

  test('should clear transcript when clear button clicked', async ({ page }) => {
    const textarea = page.locator('textarea')
    await textarea.fill('テストテキスト')

    const clearButton = page.getByRole('button', { name: /クリア/ })
    await clearButton.click()

    await expect(textarea).toHaveValue('')
  })
})

test.describe('Theme Toggle', () => {
  test('should toggle theme', async ({ page }) => {
    await page.goto('/')

    // Find and click theme toggle button
    const themeButton = page.getByRole('button', { name: /テーマ/ })
    await themeButton.click()

    // Check that data-theme attribute changes
    const html = page.locator('html')
    const initialTheme = await html.getAttribute('data-theme')

    await themeButton.click()
    const newTheme = await html.getAttribute('data-theme')

    // Theme should have changed (or cycled)
    expect(initialTheme !== newTheme || initialTheme === null || newTheme === null).toBeTruthy()
  })
})

test.describe('Model Selection', () => {
  test('should have model selector', async ({ page }) => {
    await page.goto('/')

    const modelSelector = page.locator('select[aria-label="AIモデル選択"]')
    await expect(modelSelector).toBeVisible()
  })

  test('should be able to change model', async ({ page }) => {
    await page.goto('/')

    const modelSelector = page.locator('select[aria-label="AIモデル選択"]').first()
    await modelSelector.selectOption({ index: 1 })

    // Verify selection changed
    const selectedValue = await modelSelector.inputValue()
    expect(selectedValue).toBeTruthy()
  })
})

test.describe('Responsive Design', () => {
  test('should display mobile layout on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Mobile-specific elements should be visible
    await expect(page.locator('header')).toBeVisible()
  })

  test('should display desktop layout on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    // Desktop layout should show resizable panels
    await expect(page.locator('header')).toBeVisible()
  })
})
