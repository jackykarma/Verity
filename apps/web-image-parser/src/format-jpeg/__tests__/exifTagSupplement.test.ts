import { describe, expect, it } from 'vitest'
import { collectOrderedIfdTags, readIfdTagRawValue } from '../TiffIfdWalker.ts'

/**
 * @vitest-environment node
 */
describe('exifTagSupplement + raw IFD read', () => {
  it('reads Microsoft ThumbnailFormat/Width/Height from synthetic IFD0', () => {
  // Minimal TIFF: II, IFD0 with 3 tags (5012,5013,5014)
  const buf = new ArrayBuffer(128)
  const d = new Uint8Array(buf)
  let o = 0
  d[o++] = 0x49
  d[o++] = 0x49 // II
  d[o++] = 0x2a
  d[o++] = 0
  const ifd0Off = 8
  d[o++] = ifd0Off
  d[o++] = 0
  d[o++] = 0
  d[o++] = 0

  const ifd = ifd0Off
  d[ifd] = 3
  d[ifd + 1] = 0 // 3 entries
  const writeEntry = (idx: number, tag: number, type: number, count: number, val: number) => {
    const e = ifd + 2 + idx * 12
    d[e] = tag & 0xff
    d[e + 1] = tag >> 8
    d[e + 2] = type & 0xff
    d[e + 3] = type >> 8
    d[e + 4] = count
    d[e + 5] = 0
    d[e + 6] = 0
    d[e + 7] = 0
    d[e + 8] = val
    d[e + 9] = 0
    d[e + 10] = 0
    d[e + 11] = 0
  }
  writeEntry(0, 0x5012, 4, 1, 1) // ThumbnailFormat = JPEG
  writeEntry(1, 0x5013, 4, 1, 160)
  writeEntry(2, 0x5014, 4, 1, 120)
  d[ifd + 2 + 3 * 12] = 0 // next IFD = 0

  const wrapped = new Uint8Array(6 + d.length)
  wrapped.set([0x45, 0x78, 0x69, 0x66, 0, 0], 0)
  wrapped.set(d, 6)

  const le = true
  const tiffStart = 6
  const ifd0Offset = 8
  expect(readIfdTagRawValue(wrapped, tiffStart, ifd0Offset, 0x5012, le)).toBe(1)
  expect(readIfdTagRawValue(wrapped, tiffStart, ifd0Offset, 0x5013, le)).toBe(160)
  expect(readIfdTagRawValue(wrapped, tiffStart, ifd0Offset, 0x5014, le)).toBe(120)

  const tags = collectOrderedIfdTags(wrapped)
  const names = tags.map((t) => `${t.groupLabel} · ${t.tagName}`)
  expect(names).toEqual(['IFD0 · ThumbnailFormat', 'IFD0 · ThumbnailWidth', 'IFD0 · ThumbnailHeight'])
  })
})
