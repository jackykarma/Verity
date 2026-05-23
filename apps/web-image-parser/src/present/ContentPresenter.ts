import type { PresentRequest, PresentResult } from '../shared/types/present.ts'
import { presentFailureMessage } from './copy.ts'
import { emitPresentTelemetry } from './PresentTelemetry.ts'
import { PreviewCache } from './PreviewCache.ts'
import { failureKindForEmpty, resolvePresentStrategy } from './PresentStrategyRouter.ts'
import { renderAuxImage } from './renderers/AuxImageRenderer.ts'
import { renderAudioPlayback } from './renderers/AudioPlaybackRenderer.ts'
import { renderImagePreview } from './renderers/ImagePreviewRenderer.ts'
import { renderReadable } from './renderers/ReadableRenderer.ts'
import { renderVideoPlayback } from './renderers/VideoPlaybackRenderer.ts'
import { renderMixedPayload } from './MixedPayloadPresenter.ts'

export class ContentPresenter {
  private cache = new PreviewCache()
  private presentSeq = 0
  private abortController: AbortController | null = null

  async present(req: PresentRequest): Promise<PresentResult> {
    const seq = ++this.presentSeq
    this.abortController?.abort()
    this.abortController = new AbortController()
    const started = performance.now()

    const cached = this.cache.get(req.segmentId)
    if (cached) {
      return { status: 'success', failureKind: null, viewModel: cached.viewModel }
    }

    const strategy = resolvePresentStrategy(req)
    if (strategy === 'empty') {
      const result: PresentResult = {
        status: 'failed',
        failureKind: failureKindForEmpty(req),
        viewModel: { kind: 'empty', message: presentFailureMessage('NO_CONTENT') },
      }
      emitPresentTelemetry({
        segmentId: req.segmentId,
        failureKind: result.failureKind,
        status: result.status,
        durationMs: performance.now() - started,
      })
      return result
    }

    let result: PresentResult

    switch (strategy) {
      case 'image':
        result =
          req.auxSubtype !== null
            ? await renderAuxImage(req)
            : await renderImagePreview(req)
        break
      case 'video':
        result = await renderVideoPlayback(req)
        break
      case 'audio':
        result = await renderAudioPlayback(req)
        break
      case 'readable':
        result = await renderReadable(req)
        break
      case 'mixed':
        result = await renderMixedPayload(req)
        break
      default:
        result = {
          status: 'failed',
          failureKind: 'NO_CONTENT',
          viewModel: { kind: 'empty', message: presentFailureMessage('NO_CONTENT') },
        }
    }

    if (seq !== this.presentSeq) {
      return result
    }

    if (result.status === 'success' || result.status === 'degraded') {
      this.cache.put(req.segmentId, result.viewModel)
    }

    emitPresentTelemetry({
      segmentId: req.segmentId,
      failureKind: result.failureKind,
      status: result.status,
      durationMs: performance.now() - started,
    })

    return result
  }

  dispose(): void {
    this.presentSeq += 1
    this.abortController?.abort()
    this.abortController = null
    this.cache.clear()
  }
}

export const contentPresenter = new ContentPresenter()
