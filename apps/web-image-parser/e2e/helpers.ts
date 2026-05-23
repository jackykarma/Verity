import { resolve } from 'node:path'
import type { Page } from '@playwright/test'

export const ASSETS = resolve(
  import.meta.dirname,
  '../../../specs/epics/EPIC-005-web-image-parser/test-assets',
)

export async function uploadSample(page: Page, relativePath: string): Promise<void> {
  const filePath = resolve(ASSETS, relativePath)
  await page.getByTestId('file-input').setInputFiles(filePath)
}

export async function waitParseComplete(page: Page): Promise<void> {
  await page.getByTestId('parse-phase').waitFor({ state: 'visible' })
  await page
    .getByTestId('parse-phase')
    .filter({ hasText: /解析完成|部分成功|解析失败/ })
    .waitFor({ timeout: 60_000 })
}

export async function expectTreeVisible(page: Page): Promise<void> {
  await page.getByTestId('segment-tree').waitFor({ state: 'visible' })
  await page.locator('[data-testid="tree-node"]').first().waitFor({ state: 'visible' })
}
