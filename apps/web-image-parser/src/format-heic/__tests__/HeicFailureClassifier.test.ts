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
    expect(
      classifyHeicParseOutcome('success', false, envC, 10, ['末尾 123 字节为厂商未封装媒体数据（常见于 OPPO/高通），非文件截断'])
        .kind,
    ).toBe('unsupported_env')
  })
})
