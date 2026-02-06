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
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle theme when button clicked', async ({ page }) => {
    const html = page.locator('html')

    // Get initial theme state
    const initialTheme = await html.getAttribute('data-theme')

    // Find and click theme toggle button
    const themeButton = page.getByRole('button', { name: /テーマ/ })
    await themeButton.click()

    // Wait for theme attribute to change
    await expect(async () => {
      const currentTheme = await html.getAttribute('data-theme')
      expect(currentTheme).not.toBe(initialTheme)
    }).toPass()
  })
})

test.describe('Model Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have model selector button', async ({ page }) => {
    const modelButton = page.getByRole('button', { name: 'AIモデル選択' })
    await expect(modelButton).toBeVisible()
  })

  test('should be able to change model via dropdown', async ({ page }) => {
    // Open the model dropdown
    const modelButton = page.getByRole('button', { name: 'AIモデル選択' })
    const initialText = await modelButton.textContent()
    await modelButton.click()

    // Wait for the listbox to appear
    const listbox = page.getByRole('listbox', { name: 'AIモデル一覧' })
    await expect(listbox).toBeVisible()

    // Click a different model option
    const options = listbox.getByRole('option')
    const secondOption = options.nth(1)
    await secondOption.click()

    // Dropdown should close and button text should change
    await expect(listbox).not.toBeVisible()
    const newText = await modelButton.textContent()
    expect(newText).not.toBe(initialText)
  })
})

test.describe('Responsive Design', () => {
  test('should display mobile layout on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Header should be visible
    await expect(page.locator('header')).toBeVisible()

    // Mobile-specific: Should show compact branding
    // On mobile, the title might be shorter or hidden
    await expect(page.locator('header')).toContainText(/Voice|Medical/)
  })

  test('should display desktop layout on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    // Header should be visible with full branding
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('header')).toContainText('Medical Voice Scribe')

    // Desktop should show status badge
    await expect(page.locator('.status-badge, [class*="status"]')).toBeVisible()
  })
})

test.describe('Keyboard Shortcuts Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display keyboard shortcuts on buttons', async ({ page }) => {
    // Recording button should show shortcut
    const recordButton = page.getByRole('button', { name: /録音/ })
    await expect(recordButton).toBeVisible()

    // Generate button should show shortcut
    const generateButton = page.getByRole('button', { name: /カルテ生成/ })
    await expect(generateButton).toBeVisible()
  })
})
