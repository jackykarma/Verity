import { test, expect } from '@playwright/test'
import { uploadSample, waitParseComplete } from './helpers.ts'

test('T127: 20 consecutive upload/reset cycles without page reload', async ({ page }) => {
  await page.goto('/')

  for (let i = 0; i < 20; i++) {
    await uploadSample(page, 'jpeg/S-JPEG-02_JFIF_small.jpg')
    await waitParseComplete(page)
    await expect(page.locator('[data-testid="tree-node"]').first()).toBeVisible()

    const resetBtn = page.getByRole('button', { name: '清除' })
    if (await resetBtn.isVisible()) {
      await resetBtn.click()
    }
    await expect(page.getByTestId('parse-phase')).toContainText('等待文件')
  }
})
