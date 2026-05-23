import { describe, expect, it } from 'vitest'
import { appendMpoNodes } from '../MpoHandler.ts'
import type { RawSegment } from '../JpegSegmentScanner.ts'
import type { SegmentNodeDto } from '../../shared/types/parseMessages.ts'

/**
 * @vitest-environment node
 */
describe('MpoHandler', () => {
  it('appends MPO and MPF child nodes for APP2 MPF segment', () => {
    const payload = new Uint8Array([
      0xff, 0xe2, 0x00, 0x10, 0x4d, 0x50, 0x46, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ])
    const buffer = payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength)
    const segments: RawSegment[] = [
      {
        offset: 0,
        length: 16,
        marker: 0xe2,
        parCatalogId: 'PAR-JPEG-028',
        label: 'APP2 (MPF)',
        loadType: 'metadata',
        warning: false,
      },
    ]
    const nodes: SegmentNodeDto[] = [
      {
        id: 'seg-0',
        parentId: 'root',
        label: 'APP2 (MPF)',
        parCatalogId: 'PAR-JPEG-028',
        offset: 0,
        length: 16,
        loadType: 'metadata',
        warning: false,
      },
    ]

    appendMpoNodes(segments, buffer, nodes)

    expect(nodes.some((n) => n.parCatalogId === 'PAR-JPEG-019')).toBe(true)
    expect(nodes.some((n) => n.parCatalogId === 'PAR-JPEG-028' && n.label.includes('MPF'))).toBe(true)
  })
})
