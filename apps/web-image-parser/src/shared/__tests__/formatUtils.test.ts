import { describe, expect, it } from 'vitest'
import { formatByteOffset } from '../formatUtils.ts'

describe('formatByteOffset', () => {
  it('shows hex and decimal', () => {
    expect(formatByteOffset(0x38a)).toBe('0x38a (906)')
    expect(formatByteOffset(0)).toBe('0x0 (0)')
  })
})
