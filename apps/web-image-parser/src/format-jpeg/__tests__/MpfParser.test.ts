import { describe, expect, it } from 'vitest'
import {
  buildMpfGallery,
  buildMpfPreviewBytes,
  buildMpfReadable,
  buildMpImageEntryFields,
  enrichMpfEntriesWithContainer,
  extractEmbeddedJpegRange,
  extractJpegFromMpfByteRange,
  normalizeMpfEntries,
  parseMpfSegment,
  type MpfImageEntry,
} from '../MpfParser.ts'

function writeU16(data: Uint8Array, offset: number, value: number, le = true) {
  if (le) {
    data[offset] = value & 0xff
    data[offset + 1] = (value >> 8) & 0xff
  } else {
    data[offset] = (value >> 8) & 0xff
    data[offset + 1] = value & 0xff
  }
}

function writeU32(data: Uint8Array, offset: number, value: number, le = true) {
  if (le) {
    data[offset] = value & 0xff
    data[offset + 1] = (value >> 8) & 0xff
    data[offset + 2] = (value >> 16) & 0xff
    data[offset + 3] = (value >> 24) & 0xff
  } else {
    data[offset] = (value >> 24) & 0xff
    data[offset + 1] = (value >> 16) & 0xff
    data[offset + 2] = (value >> 8) & 0xff
    data[offset + 3] = value & 0xff
  }
}

function buildMpfApp2Segment(imageEntries: { offset: number; size: number; attr?: number }[]) {
  const mpEntryBytes = imageEntries.length * 16
  const mpfOffset = 4
  const tiffStart = mpfOffset + 4
  const ifdAbs = tiffStart + 8
  const mpEntryAbs = ifdAbs + 2 + 2 * 12 + 4
  const totalPayload = mpEntryAbs + mpEntryBytes - mpfOffset
  const segment = new Uint8Array(4 + totalPayload)
  writeU16(segment, 0, 0xffe2)
  writeU16(segment, 2, totalPayload + 2)

  segment[mpfOffset] = 0x4d
  segment[mpfOffset + 1] = 0x50
  segment[mpfOffset + 2] = 0x46
  segment[mpfOffset + 3] = 0
  writeU16(segment, tiffStart, 0x4949)
  writeU16(segment, tiffStart + 2, 42)
  writeU32(segment, tiffStart + 4, ifdAbs - tiffStart)
  writeU16(segment, ifdAbs, 2)
  writeU16(segment, ifdAbs + 2, 0xb000)
  writeU16(segment, ifdAbs + 4, 7)
  writeU32(segment, ifdAbs + 6, 4)
  segment[ifdAbs + 10] = 0x30
  segment[ifdAbs + 11] = 0x31
  segment[ifdAbs + 12] = 0x30
  segment[ifdAbs + 13] = 0x30

  writeU16(segment, ifdAbs + 14, 0xb002)
  writeU16(segment, ifdAbs + 16, 7)
  writeU32(segment, ifdAbs + 18, mpEntryBytes)
  writeU32(segment, ifdAbs + 22, mpEntryAbs - tiffStart)

  writeU32(segment, ifdAbs + 26, 0)

  imageEntries.forEach((entry, index) => {
    const base = mpEntryAbs + index * 16
    writeU32(segment, base, entry.attr ?? 0x0200_0001)
    writeU32(segment, base + 4, entry.size)
    writeU32(segment, base + 8, entry.offset)
    writeU16(segment, base + 12, 0)
    writeU16(segment, base + 14, 0)
  })

  return segment
}

function bareEntry(
  partial: Partial<MpfImageEntry> & Pick<MpfImageEntry, 'index' | 'offset' | 'size'>,
): MpfImageEntry {
  return {
    rawAttr: 0,
    flags: 0,
    flagsLabel: 'Flags 0x0',
    formatCode: 0,
    format: 'JPEG',
    imageType: 0,
    imageTypeLabel: 'Undefined',
    role: '默认视图',
    dependent1: 0,
    dependent2: 0,
    ...partial,
  }
}

/**
 * @vitest-environment node
 */
describe('MpfParser', () => {
  it('parses MPF entries and builds readable fields', () => {
    const jpegA = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const jpegB = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
    ])
    const mpfSeg = buildMpfApp2Segment([
      { offset: 100, size: jpegA.byteLength, attr: 0x2000_0001 },
      { offset: 104, size: jpegB.byteLength, attr: 0x8000_0001 },
    ])

    const file = new Uint8Array(200)
    file.set(mpfSeg, 0)
    file.set(jpegA, 100)
    file.set(jpegB, 104)

    const parsed = parseMpfSegment(file.buffer, 0, mpfSeg.byteLength)
    expect(parsed).not.toBeNull()
    expect(parsed!.entries).toHaveLength(2)
    expect(parsed!.entries[0]?.flagsLabel).toContain('Representative')
    expect(parsed!.entries[1]?.flagsLabel).toContain('Dependent')

    const readable = buildMpfReadable(parsed!)
    const keys = readable.fields.map((f) => f.key)
    expect(keys).toContain('MPImage 1 · MPImageFlags')
    expect(keys).toContain('MPImage 1 · MPImageType')
    expect(keys).toContain('MPImage 2 · MPImageStart')
    expect(keys).toContain('MPImage 1 · DependentImage1EntryNumber')
    expect(keys).not.toContain('MPImage 1 · 摘要')
    expect(keys).not.toContain('MPImage 1 · rawAttr')

    const mp1Fields = buildMpImageEntryFields(parsed!.entries[0]!)
    expect(mp1Fields.map((f) => f.key.replace(/^MPImage \d+ · /, ''))).toEqual([
      'MPImageFlags',
      'MPImageFormat',
      'MPImageType',
      'MPImageLength',
      'MPImageStart',
      'DependentImage1EntryNumber',
      'DependentImage2EntryNumber',
    ])

    const gallery = buildMpfGallery(file.buffer, parsed!, 'session-test')
    expect(gallery).toHaveLength(2)
    expect(gallery[0]?.src.startsWith('blob:')).toBe(true)
  })

  it('extractEmbeddedJpegRange trims oversized size and extends undersized size', () => {
    const jpegB = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
    ])
    const file = new Uint8Array(80)
    file.set(jpegB, 20)
    file.fill(0x00, 20 + jpegB.byteLength)

    const oversized = extractEmbeddedJpegRange(file, 20, 80)
    expect(oversized).toEqual({ offset: 20, length: jpegB.byteLength })

    const undersized = extractEmbeddedJpegRange(file, 20, 8)
    expect(undersized?.length).toBe(jpegB.byteLength)
  })

  it('normalizeMpfEntries splits concatenated MPO without intermediate EOI', () => {
    const jpegA = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xda])
    const jpegB = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const file = new Uint8Array(jpegA.length + jpegB.length)
    file.set(jpegA, 0)
    file.set(jpegB, jpegA.length)

    const normalized = normalizeMpfEntries(file.buffer, [
      bareEntry({ index: 0, size: 0, offset: 0 }),
      bareEntry({ index: 1, size: 0, offset: jpegA.length }),
    ])

    expect(normalized[0]?.size).toBe(jpegA.length)
    expect(normalized[1]?.size).toBe(jpegB.length)
  })

  it('buildMpfPreviewBytes uses full file for primary and complete slice for secondary', () => {
    const jpegA = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xda])
    const jpegB = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const file = new Uint8Array(jpegA.length + jpegB.length)
    file.set(jpegA, 0)
    file.set(jpegB, jpegA.length)

    const entries = normalizeMpfEntries(file.buffer, [
      bareEntry({ index: 0, size: 0, offset: 0 }),
      bareEntry({ index: 1, size: 0, offset: jpegA.length }),
    ])

    const primary = buildMpfPreviewBytes(file.buffer, entries[0]!, entries)
    const secondary = buildMpfPreviewBytes(file.buffer, entries[1]!, entries)

    expect(primary?.byteLength).toBe(file.byteLength)
    expect(secondary?.byteLength).toBe(jpegB.byteLength)
    expect(secondary?.[0]).toBe(0xff)
    expect(secondary?.[1]).toBe(0xd8)
    expect(secondary?.[secondary.length - 2]).toBe(0xff)
    expect(secondary?.[secondary.length - 1]).toBe(0xd9)
  })

  it('buildMpfPreviewBytes falls back to SOI index when MP Entry offset is wrong', () => {
    const jpegA = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xda])
    const jpegB = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
    const file = new Uint8Array(jpegA.length + jpegB.length)
    file.set(jpegA, 0)
    file.set(jpegB, jpegA.length)

    const entries = normalizeMpfEntries(file.buffer, [
      bareEntry({ index: 0, size: 0, offset: 0 }),
      bareEntry({ index: 1, size: 9999, offset: 1 }),
    ])

    const secondary = buildMpfPreviewBytes(file.buffer, entries[1]!, entries)
    expect(secondary?.byteLength).toBe(jpegB.byteLength)
    expect(secondary?.[0]).toBe(0xff)
    expect(secondary?.[1]).toBe(0xd8)
  })

  it('parses Gain Map Image MPImageType 0x50000 per ExifTool', () => {
    const mpfSeg = buildMpfApp2Segment([{ offset: 100, size: 512, attr: 0x0005_0000 }])
    const parsed = parseMpfSegment(mpfSeg.buffer, 0, mpfSeg.byteLength)
    expect(parsed?.entries[0]?.imageType).toBe(0x50000)
    expect(parsed?.entries[0]?.imageTypeLabel).toBe('Gain Map Image')
    expect(parsed?.entries[0]?.formatCode).toBe(0)
  })

  it('extracts Gain Map preview strictly from MPImageStart and MPImageLength', () => {
    const primaryJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xda, 0xff, 0xd9])
    const gainMapJpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07,
      0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12, 0x13, 0x0f,
      0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c,
      0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d,
      0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xd9,
    ])
    const gap = 64
    const gainOffset = primaryJpeg.length + gap
    const file = new Uint8Array(gainOffset + gainMapJpeg.length)
    file.set(primaryJpeg, 0)
    file.set(gainMapJpeg, gainOffset)

    const entries = normalizeMpfEntries(file.buffer, [
      bareEntry({ index: 0, offset: 0, size: primaryJpeg.length, imageType: 0x30000, imageTypeLabel: 'Baseline MP Primary Image', role: 'Baseline MP Primary Image' }),
      bareEntry({ index: 1, offset: gainOffset, size: gainMapJpeg.length, imageType: 0x50000, imageTypeLabel: 'Gain Map Image', role: 'Gain Map Image' }),
    ])

    expect(entries[1]?.offset).toBe(gainOffset)
    expect(entries[1]?.size).toBe(gainMapJpeg.length)

    const sliced = extractJpegFromMpfByteRange(file, gainOffset, gainMapJpeg.length)
    expect(sliced?.byteLength).toBe(gainMapJpeg.byteLength)

    const preview = buildMpfPreviewBytes(file.buffer, entries[1]!, entries)
    expect(preview?.byteLength).toBe(gainMapJpeg.byteLength)
    expect(Array.from(preview!)).toEqual(Array.from(gainMapJpeg))
    expect(preview).not.toEqual(buildMpfPreviewBytes(file.buffer, entries[0]!, entries))
  })

  it('infers Gain Map Image from XMP Container when MP attr type is 0', () => {
    const entry = bareEntry({ index: 0, offset: 100, size: 512, rawAttr: 0 })
    const enriched = enrichMpfEntriesWithContainer([entry], [
      { index: 0, semantic: 'GainMap', mime: 'image/jpeg', length: 512, padding: 0, offset: 200 },
    ])
    expect(enriched[0]?.imageType).toBe(0x50000)
    expect(enriched[0]?.imageTypeLabel).toBe('Gain Map Image')
    const typeField = buildMpImageEntryFields(enriched[0]!)[2]
    expect(typeField?.value).toBe('Gain Map Image (0x50000)')
  })
})
