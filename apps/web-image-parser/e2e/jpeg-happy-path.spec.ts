import { test, expect } from '@playwright/test'
import { expectTreeVisible, uploadSample, waitParseComplete } from './helpers.ts'

test('T234: upload → parse → select EXIF → readable detail', async ({ page }) => {
  await page.goto('/')
  await uploadSample(page, 'jpeg/S-JPEG-01_Canon_40D_EXIF.jpg')
  await waitParseComplete(page)
  await expectTreeVisible(page)

  const exifButton = page.locator('[data-testid="tree-node"]').filter({ hasText: 'EXIF IFD' }).first()
  await exifButton.click()

  const detail = page.getByTestId('detail-panel')
  await expect(detail).toBeVisible()
  await expect(detail.locator('.detail-panel__readable')).toBeVisible({ timeout: 10_000 })
  await expect(detail.locator('dt').first()).toBeVisible()
})
