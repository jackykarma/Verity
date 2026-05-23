import { test, expect } from '@playwright/test'
import { expectTreeVisible, uploadSample, waitParseComplete } from './helpers.ts'

test('T140: upload JPEG → parse → workbench framework visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Web 图片数据解析器' })).toBeVisible()
  await expect(page.getByTestId('ingest-zone')).toBeVisible()

  await uploadSample(page, 'jpeg/S-JPEG-01_Canon_40D_EXIF.jpg')
  await waitParseComplete(page)
  await expectTreeVisible(page)

  await expect(page.getByTestId('format-slot')).toContainText('JPEG')
  await expect(page.getByTestId('detail-panel')).toBeVisible()
})
