import { describe, expect, it } from 'vitest'
import { resolvePresentStrategy } from '../PresentStrategyRouter.ts'
import type { PresentRequest } from '../../shared/types/present.ts'

function baseReq(overrides: Partial<PresentRequest> = {}): PresentRequest {
  return {
    segmentId: 'seg-1',
    sessionId: 'sess-1',
    payloadKind: 'image',
    auxSubtype: null,
    contentRef: { kind: 'byteRange', sessionId: 'sess-1', offset: 0, length: 100 },
    readablePayload: null,
    ...overrides,
  }
}

describe('PresentStrategyRouter', () => {
  it('routes image payload', () => {
    expect(resolvePresentStrategy(baseReq({ payloadKind: 'image' }))).toBe('image')
  })

  it('routes video payload', () => {
    expect(resolvePresentStrategy(baseReq({ payloadKind: 'video' }))).toBe('video')
  })

  it('routes metadata to readable', () => {
    expect(resolvePresentStrategy(baseReq({ payloadKind: 'metadata' }))).toBe('readable')
  })

  it('returns empty when no content', () => {
    expect(
      resolvePresentStrategy(
        baseReq({ contentRef: null, readablePayload: null, payloadKind: 'other' }),
      ),
    ).toBe('empty')
  })

  it('routes mixed payload', () => {
    expect(resolvePresentStrategy(baseReq({ payloadKind: 'mixed' }))).toBe('mixed')
  })
})
