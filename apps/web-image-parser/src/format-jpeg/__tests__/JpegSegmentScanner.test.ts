import { describe, expect, it } from 'vitest'
import { scanMarkers } from '../JpegSegmentScanner.ts'
import { parseJpegBuffer } from '../JpegParser.ts'

describe('JpegSegmentScanner', () => {
  it('includes SOI and EOI for minimal JPEG', () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const { segments } = scanMarkers(bytes.buffer)
    const ids = segments.map((s) => s.parCatalogId)
    expect(ids).toContain('PAR-JPEG-001')
    expect(ids).toContain('PAR-JPEG-002')
  })

  it('detects APP0 JFIF signature', () => {
    const bytes = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xe0, 0x00, 0x10,
      0x4a, 0x46, 0x49, 0x46, 0x00,
      0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
      0xff, 0xd9,
    ])
    const { segments } = scanMarkers(bytes.buffer)
    expect(segments.some((s) => s.parCatalogId === 'PAR-JPEG-003')).toBe(true)
  })

  it('finds EOI after SOS without false truncation warning', () => {
    const bytes = new Uint8Array([
      0xff, 0xd8,
      0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
      0x00, 0x11, 0x22,
      0xff, 0xd9,
    ])
    const { segments, truncated, warnings } = scanMarkers(bytes.buffer)
    expect(segments.some((s) => s.parCatalogId === 'PAR-JPEG-002')).toBe(true)
    expect(segments.some((s) => s.parCatalogId === 'PAR-JPEG-015')).toBe(true)
    expect(truncated).toBe(false)
    expect(warnings.some((w) => w.includes('缺少 0xFF'))).toBe(false)
  })

  it('marks truncated file as partial', async () => {
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
