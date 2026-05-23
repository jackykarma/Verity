import { describe, expect, it } from 'vitest'
import { validateFile } from '../SessionStore.ts'
import { MAX_FILE_SIZE_BYTES } from '../types/session.ts'

describe('IngestService validation', () => {
  it('accepts valid JPEG', async () => {
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])], 'sample.jpg', {
      type: 'image/jpeg',
    })
    const result = await validateFile(file)
    expect(result.ok).toBe(true)
    expect(result.format).toBe('jpeg')
  })

  it('rejects PNG (SC-007)', async () => {
    const file = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], 'sample.png', {
      type: 'image/png',
    })
    const result = await validateFile(file)
    expect(result.ok).toBe(false)
    expect(result.failureType).toBe('UNSUPPORTED_TYPE')
  })

  it('rejects file over 50MB (SC-006)', async () => {
    const big = new File([new Uint8Array(64)], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(big, 'size', { value: MAX_FILE_SIZE_BYTES + 1 })
    const result = await validateFile(big)
    expect(result.ok).toBe(false)
    expect(result.failureType).toBe('FILE_TOO_LARGE')
  })
})
