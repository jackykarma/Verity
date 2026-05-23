import { describe, expect, it } from 'vitest'
import { classifyHeicParseOutcome } from '../HeicFailureClassifier.ts'

describe('HeicFailureClassifier', () => {
  const envC = {
    level: 'C' as const,
    canPreviewImage: false,
    canPlayVideo: false,
    message: '不支持 HEIC',
  }

  it('distinguishes corrupted from unsupported env', () => {
    expect(classifyHeicParseOutcome('failed', false, envC, 0).kind).toBe('corrupted')
    expect(classifyHeicParseOutcome('success', false, envC, 10).kind).toBe('unsupported_env')
    expect(classifyHeicParseOutcome('partial', true, envC, 10).kind).toBe('truncated')
  })
})
