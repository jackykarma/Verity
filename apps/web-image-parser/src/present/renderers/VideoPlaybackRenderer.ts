import { SessionStore } from '../../shared/SessionStore.ts'
import type { PresentRequest, PresentResult } from '../../shared/types/present.ts'
import { presentFailureMessage } from '../copy.ts'
import { resolveContentUrl } from './contentRefUtils.ts'

export async function renderVideoPlayback(req: PresentRequest): Promise<PresentResult> {
  const session = SessionStore.getInstance().getSession(req.sessionId)
  const mimeCandidates =
    session?.detectedFormat === 'heic'
      ? ['video/quicktime', 'video/mp4', 'video/hevc']
      : ['video/mp4', 'video/quicktime']

  for (const mimeType of mimeCandidates) {
    const src = resolveContentUrl(req.contentRef, mimeType)
    if (src) {
      return {
        status: 'success',
        failureKind: null,
        viewModel: { kind: 'video', src, mimeType },
      }
    }
  }

  return {
    status: 'failed',
    failureKind: 'PLAYBACK_FAILED',
    viewModel: { kind: 'empty', message: presentFailureMessage('PLAYBACK_FAILED') },
  }
}
