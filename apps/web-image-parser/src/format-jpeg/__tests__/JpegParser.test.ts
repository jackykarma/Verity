import { describe, expect, it } from 'vitest'
import { parseJpegBuffer } from '../JpegParser.ts'

describe('JpegParser', () => {
  it('parses minimal JPEG with SOI and EOI', async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const result = await parseJpegBuffer(bytes.buffer)
    expect(result.status).toBe('success')
    expect(result.tree?.nodes.length).toBeGreaterThan(1)
  })

  it('returns partial for truncated file', async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])
    const result = await parseJpegBuffer(bytes.buffer)
    expect(result.status).toBe('partial')
  })

  it('returns failed for non-JPEG', async () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    const result = await parseJpegBuffer(bytes.buffer)
    expect(result.status).toBe('failed')
  })
})
