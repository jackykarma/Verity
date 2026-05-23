import type { PresentRequest, PresentResult } from '../../shared/types/present.ts'
import { presentFailureMessage } from '../copy.ts'
import { resolveContentUrl } from './contentRefUtils.ts'

export async function renderAudioPlayback(req: PresentRequest): Promise<PresentResult> {
  const src = resolveContentUrl(req.contentRef, 'audio/mp4')
  if (!src) {
    return {
      status: 'failed',
      failureKind: 'PLAYBACK_FAILED',
      viewModel: { kind: 'empty', message: presentFailureMessage('PLAYBACK_FAILED') },
    }
  }

  return {
    status: 'success',
    failureKind: null,
    viewModel: { kind: 'audio', src, mimeType: 'audio/mp4' },
  }
}
