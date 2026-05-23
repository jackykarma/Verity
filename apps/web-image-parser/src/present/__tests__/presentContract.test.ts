import { describe, expect, it } from 'vitest'
import { ContentPresenter } from '../ContentPresenter.ts'
import { PRESENT_COPY } from '../copy.ts'
import { failureKindForEmpty, resolvePresentStrategy } from '../PresentStrategyRouter.ts'
import type { PresentRequest } from '../../shared/types/present.ts'

describe('presentContract', () => {
  it('PresentRequest fields align with interface-design', () => {
    const req: PresentRequest = {
      segmentId: 'seg-1',
      sessionId: 'sess-1',
      payloadKind: 'image',
      auxSubtype: null,
      contentRef: { kind: 'byteRange', sessionId: 'sess-1', offset: 0, length: 100 },
      readablePayload: null,
    }
    expect(req.segmentId).toBeTruthy()
    expect(req.sessionId).toBeTruthy()
    expect(resolvePresentStrategy(req)).toBe('image')
  })

  it('empty content returns NO_CONTENT failure kind', () => {
    const req: PresentRequest = {
      segmentId: 'seg-empty',
      sessionId: 'sess-1',
      payloadKind: 'other',
      auxSubtype: null,
      contentRef: null,
      readablePayload: null,
    }
    expect(failureKindForEmpty(req)).toBe('NO_CONTENT')
    expect(PRESENT_COPY.NO_CONTENT).toBeTruthy()
  })

  it('ContentPresenter returns failed for empty request', async () => {
    const presenter = new ContentPresenter()
    const result = await presenter.present({
      segmentId: 'x',
      sessionId: 's',
      payloadKind: 'other',
      auxSubtype: null,
      contentRef: null,
      readablePayload: null,
    })
    expect(result.status).toBe('failed')
    expect(result.failureKind).toBe('NO_CONTENT')
  })
})
