import { tagKeys } from 'exifr'
import { supplementTagName } from './exifTagSupplement.ts'

export type IfdBlockKey = 'ifd0' | 'ifd1' | 'exif' | 'gps' | 'interop'

export interface OrderedIfdTag {
  blockKey: IfdBlockKey
  groupLabel: string
  tagId: number
  tagName: string
  /** TIFF 头内 IFD 起始偏移 */
  ifdOffset: number
}

const GROUP_LABELS: Record<IfdBlockKey, string> = {
  ifd0: 'IFD0',
  ifd1: 'IFD1',
  exif: 'ExifIFD',
  gps: 'GPS IFD',
  interop: 'InteropIFD',
}

/** IFD 内仅作跳转、不在字段列表中展示的指针 Tag */
const IFD_POINTER_TAGS = new Set([34665, 34853, 40965, 330])

export function findExifTiffStart(data: Uint8Array): number | null {
  for (let i = 0; i < data.length - 10; i++) {
    if (
      data[i] === 0x45 &&
      data[i + 1] === 0x78 &&
      data[i + 2] === 0x69 &&
      data[i + 3] === 0x66 &&
      data[i + 4] === 0 &&
      data[i + 5] === 0
    ) {
      return i + 6
    }
  }
  return null
}

export function isTiffLittleEndian(data: Uint8Array, tiffStart: number): boolean {
  return data[tiffStart] === 0x49 && data[tiffStart + 1] === 0x49
}

export function readU16(data: Uint8Array, offset: number, le: boolean): number {
  if (le) {
    return data[offset]! | (data[offset + 1]! << 8)
  }
  return (data[offset]! << 8) | data[offset + 1]!
}

export function readU32(data: Uint8Array, offset: number, le: boolean): number {
  if (le) {
    return (data[offset]! | (data[offset + 1]! << 8) | (data[offset + 2]! << 16) | (data[offset + 3]! << 24)) >>> 0
  }
  return ((data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!) >>> 0
}

function tagNameFor(blockKey: IfdBlockKey, tagId: number): string {
  const dict = tagKeys.get(blockKey === 'ifd1' ? 'ifd1' : blockKey)
  return dict?.get(tagId) ?? supplementTagName(tagId) ?? `0x${tagId.toString(16)}`
}

interface WalkIfdResult {
  tags: OrderedIfdTag[]
  exifIfdOffset: number | null
  gpsIfdOffset: number | null
  interopIfdOffset: number | null
  nextIfdOffset: number | null
}

function walkIfd(
  data: Uint8Array,
  tiffStart: number,
  ifdOffset: number,
  blockKey: IfdBlockKey,
  le: boolean,
): WalkIfdResult | null {
  if (ifdOffset <= 0) {
    return null
  }

  const ifdAbs = tiffStart + ifdOffset
  if (ifdAbs + 2 > data.length) {
    return null
  }

  const count = readU16(data, ifdAbs, le)
  const tags: OrderedIfdTag[] = []
  let exifIfdOffset: number | null = null
  let gpsIfdOffset: number | null = null
  let interopIfdOffset: number | null = null

  for (let i = 0; i < count; i++) {
    const entry = ifdAbs + 2 + i * 12
    if (entry + 12 > data.length) {
      break
    }

    const tagId = readU16(data, entry, le)
    const valueOrOffset = readU32(data, entry + 8, le)

    if (blockKey === 'ifd0') {
      if (tagId === 34665) {
        exifIfdOffset = valueOrOffset
        continue
      }
      if (tagId === 34853) {
        gpsIfdOffset = valueOrOffset
        continue
      }
      if (tagId === 40965) {
        interopIfdOffset = valueOrOffset
        continue
      }
    }

    if (blockKey === 'exif') {
      if (tagId === 40965) {
        interopIfdOffset = valueOrOffset
        continue
      }
    }

    if (IFD_POINTER_TAGS.has(tagId)) {
      continue
    }

    tags.push({
      blockKey,
      groupLabel: GROUP_LABELS[blockKey],
      tagId,
      tagName: tagNameFor(blockKey, tagId),
      ifdOffset,
    })
  }

  const nextIfdOffset =
    ifdAbs + 2 + count * 12 + 4 <= data.length
      ? readU32(data, ifdAbs + 2 + count * 12, le)
      : null

  return { tags, exifIfdOffset, gpsIfdOffset, interopIfdOffset, nextIfdOffset }
}

/** 读取 IFD 目录项原始值（exifr 未收录 Tag 时使用） */
export function readIfdTagRawValue(
  data: Uint8Array,
  tiffStart: number,
  ifdOffset: number,
  tagId: number,
  le: boolean,
): unknown | undefined {
  const ifdAbs = tiffStart + ifdOffset
  if (ifdAbs + 2 > data.length) {
    return undefined
  }

  const count = readU16(data, ifdAbs, le)
  for (let i = 0; i < count; i++) {
    const entry = ifdAbs + 2 + i * 12
    if (entry + 12 > data.length) {
      break
    }

    if (readU16(data, entry, le) !== tagId) {
      continue
    }

    const type = readU16(data, entry + 2, le)
    const valueCount = readU32(data, entry + 4, le)
    const valueOrOffset = readU32(data, entry + 8, le)
    const totalBytes = valueCount * tiffTypeSize(type)

    let valueStart = entry + 8
    if (totalBytes > 4) {
      valueStart = tiffStart + valueOrOffset
      if (valueStart + totalBytes > data.length) {
        return undefined
      }
    }

    return decodeTiffValue(data, valueStart, type, valueCount, le, totalBytes <= 4 ? valueOrOffset : undefined)
  }

  return undefined
}

function tiffTypeSize(type: number): number {
  switch (type) {
    case 1:
    case 2:
    case 6:
    case 7:
      return 1
    case 3:
    case 8:
      return 2
    case 4:
    case 9:
    case 11:
      return 4
    case 5:
    case 10:
    case 12:
      return 8
    default:
      return 1
  }
}

function decodeTiffValue(
  data: Uint8Array,
  offset: number,
  type: number,
  count: number,
  le: boolean,
  inlineU32?: number,
): unknown {
  switch (type) {
    case 1:
    case 7: {
      if (count === 1 && inlineU32 != null) {
        return inlineU32 & 0xff
      }
      const bytes = data.slice(offset, offset + count)
      return count === 1 ? bytes[0] : bytes
    }
    case 3: {
      if (count === 1 && inlineU32 != null) {
        return inlineU32 & 0xffff
      }
      const values: number[] = []
      for (let i = 0; i < count; i++) {
        values.push(readU16(data, offset + i * 2, le))
      }
      return count === 1 ? values[0] : values
    }
    case 4:
    case 9: {
      if (count === 1 && inlineU32 != null) {
        return inlineU32
      }
      const values: number[] = []
      for (let i = 0; i < count; i++) {
        values.push(readU32(data, offset + i * 4, le))
      }
      return count === 1 ? values[0] : values
    }
    case 2: {
      let end = offset
      while (end < data.length && data[end] !== 0) {
        end++
      }
      return new TextDecoder('latin1').decode(data.slice(offset, end))
    }
    default:
      if (count === 1 && inlineU32 != null) {
        return inlineU32
      }
      return inlineU32 ?? readU32(data, offset, le)
  }
}

/** 按 TIFF IFD 目录条目顺序收集 Tag（IFD0 → ExifIFD → GPS → Interop → IFD1） */
export function collectOrderedIfdTags(data: Uint8Array): OrderedIfdTag[] {
  const tiffStart = findExifTiffStart(data)
  if (tiffStart == null || tiffStart + 8 > data.length) {
    return []
  }

  const le = isTiffLittleEndian(data, tiffStart)
  const ifd0Offset = readU32(data, tiffStart + 4, le)
  const ifd0 = walkIfd(data, tiffStart, ifd0Offset, 'ifd0', le)
  if (!ifd0) {
    return []
  }

  const ordered: OrderedIfdTag[] = [...ifd0.tags]

  let interopOffset = ifd0.interopIfdOffset

  const exif = ifd0.exifIfdOffset != null ? walkIfd(data, tiffStart, ifd0.exifIfdOffset, 'exif', le) : null
  if (exif) {
    ordered.push(...exif.tags)
    if (exif.interopIfdOffset != null) {
      interopOffset = exif.interopIfdOffset
    }
  }

  const gps =
    ifd0.gpsIfdOffset != null ? walkIfd(data, tiffStart, ifd0.gpsIfdOffset, 'gps', le) : null
  if (gps) {
    ordered.push(...gps.tags)
  }

  const interop =
    interopOffset != null ? walkIfd(data, tiffStart, interopOffset, 'interop', le) : null
  if (interop) {
    ordered.push(...interop.tags)
  }

  if (ifd0.nextIfdOffset != null && ifd0.nextIfdOffset > 0) {
    const ifd1 = walkIfd(data, tiffStart, ifd0.nextIfdOffset, 'ifd1', le)
    if (ifd1) {
      ordered.push(...ifd1.tags)
    }
  }

  return ordered
}

export function bufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer)
}
