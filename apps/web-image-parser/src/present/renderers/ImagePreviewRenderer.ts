import { SessionStore } from '../../shared/SessionStore.ts'
import type { PresentRequest, PresentResult } from '../../shared/types/present.ts'
import { presentFailureMessage } from '../copy.ts'
import { resolveContentUrl } from './contentRefUtils.ts'

function imageMimeType(sessionId: string): string {
  const session = SessionStore.getInstance().getSession(sessionId)
  if (session?.detectedFormat === 'heic') {
    return 'image/heic'
  }
  return 'image/jpeg'
}

export async function renderImagePreview(req: PresentRequest): Promise<PresentResult> {
  const mime = imageMimeType(req.sessionId)
  const src = resolveContentUrl(req.contentRef, mime)
  if (!src) {
    return {
      status: 'failed',
      failureKind: 'PREVIEW_FAILED',
      viewModel: { kind: 'empty', message: presentFailureMessage('PREVIEW_FAILED') },
    }
  }

  return {
    status: 'success',
    failureKind: null,
    viewModel: {
      kind: 'image',
      src,
      alt: req.readablePayload?.title ?? req.segmentId,
    },
  }
}
