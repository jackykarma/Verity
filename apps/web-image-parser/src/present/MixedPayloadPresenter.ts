import type { PresentRequest, PresentResult } from '../shared/types/present.ts'
import { presentFailureMessage } from './copy.ts'
import { renderImagePreview } from './renderers/ImagePreviewRenderer.ts'
import { renderReadable } from './renderers/ReadableRenderer.ts'

export async function renderMixedPayload(req: PresentRequest): Promise<PresentResult> {
  const readable = req.readablePayload ?? { title: req.segmentId, fields: [] }

  if (!req.contentRef) {
    return renderReadable(req)
  }

  const imageResult = await renderImagePreview(req)
  const media =
    imageResult.status === 'success' && imageResult.viewModel.kind === 'image'
      ? imageResult.viewModel
      : ({ kind: 'empty', message: presentFailureMessage('PREVIEW_FAILED') } as const)

  return {
    status: imageResult.status === 'success' ? 'success' : 'degraded',
    failureKind: imageResult.status === 'success' ? null : 'PREVIEW_FAILED',
    viewModel: { kind: 'mixed', readable, media },
  }
}
