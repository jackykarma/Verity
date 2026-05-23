import { describe, expect, it } from 'vitest'
import { sniffFormat, isSupportedFormat } from '../fileSniff.ts'

describe('fileSniff', () => {
  it('detects JPEG magic', () => {
    const buf = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]).buffer
    const result = sniffFormat(buf, 'test.jpg')
    expect(result.format).toBe('jpeg')
  })

  it('rejects PNG', () => {
    const buf = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer
    const result = sniffFormat(buf, 'test.png')
    expect(isSupportedFormat(result.format)).toBe(false)
  })

  it('detects HEIC ftyp', () => {
    const bytes = new Uint8Array(16)
    bytes.set([0x00, 0x00, 0x00, 0x18])
    bytes.set([0x66, 0x74, 0x79, 0x70], 4) // ftyp
    bytes.set([0x68, 0x65, 0x69, 0x63], 8) // heic
    const result = sniffFormat(bytes.buffer, 'photo.heic')
    expect(result.format).toBe('heic')
  })
})
