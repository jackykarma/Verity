import type { PresentRequest, PresentResult } from '../../shared/types/present.ts'
import { presentFailureMessage } from '../copy.ts'
import { renderImagePreview } from './ImagePreviewRenderer.ts'

export async function renderAuxImage(req: PresentRequest): Promise<PresentResult> {
  const result = await renderImagePreview(req)
  if (result.status === 'failed') {
    const subtype = req.auxSubtype ?? 'unknown'
    return {
      status: 'degraded',
      failureKind: 'PREVIEW_FAILED',
      viewModel: {
        kind: 'readable',
        payload: {
          title: `辅助图像（${subtype}）`,
          fields: [
            { key: '子类型', value: subtype },
            { key: '说明', value: presentFailureMessage('PREVIEW_FAILED') },
          ],
        },
      },
    }
  }
  return result
}
