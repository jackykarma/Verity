import { test, expect } from '@playwright/test'
import { expectTreeVisible, uploadSample, waitParseComplete } from './helpers.ts'

test('T334: upload HEIC → parse → select ipma → readable detail', async ({ page }) => {
  await page.goto('/')
  await uploadSample(page, 'heic/S-HEIC-01_autumn.heic')
  await waitParseComplete(page)
  await expectTreeVisible(page)

  await expect(page.getByTestId('format-slot')).toContainText('HEIC')

  const ipmaButton = page.locator('[data-testid="tree-node"]').filter({ hasText: 'ipma' }).first()
  await ipmaButton.click()

  const detail = page.getByTestId('detail-panel')
  await expect(detail).toBeVisible()
  await expect(detail.locator('.detail-panel__readable')).toBeVisible({ timeout: 10_000 })
  await expect(detail.locator('h3')).toContainText('ipma')
})
