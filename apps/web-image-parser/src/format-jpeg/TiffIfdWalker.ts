import { tagKeys } from 'exifr'

export type IfdBlockKey = 'ifd0' | 'exif' | 'gps' | 'interop'

export interface OrderedIfdTag {
  blockKey: IfdBlockKey
  groupLabel: string
  tagId: number
  tagName: string
}

const GROUP_LABELS: Record<IfdBlockKey, string> = {
  ifd0: 'IFD0',
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

function isLittleEndian(data: Uint8Array, tiffStart: number): boolean {
  return data[tiffStart] === 0x49 && data[tiffStart + 1] === 0x49
}

function readU16(data: Uint8Array, offset: number, le: boolean): number {
  if (le) {
    return data[offset]! | (data[offset + 1]! << 8)
  }
  return (data[offset]! << 8) | data[offset + 1]!
}

function readU32(data: Uint8Array, offset: number, le: boolean): number {
  if (le) {
    return (data[offset]! | (data[offset + 1]! << 8) | (data[offset + 2]! << 16) | (data[offset + 3]! << 24)) >>> 0
  }
  return ((data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!) >>> 0
}

function tagNameFor(blockKey: IfdBlockKey, tagId: number): string {
  const dict = tagKeys.get(blockKey)
  return dict?.get(tagId) ?? `0x${tagId.toString(16)}`
}

interface WalkIfdResult {
  tags: OrderedIfdTag[]
  exifIfdOffset: number | null
  gpsIfdOffset: number | null
  interopIfdOffset: number | null
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
    })
  }

  return { tags, exifIfdOffset, gpsIfdOffset, interopIfdOffset }
}

/** 按 TIFF IFD 目录条目顺序收集 Tag（IFD0 → ExifIFD → GPS → Interop） */
export function collectOrderedIfdTags(data: Uint8Array): OrderedIfdTag[] {
  const tiffStart = findExifTiffStart(data)
  if (tiffStart == null || tiffStart + 8 > data.length) {
    return []
  }

  const le = isLittleEndian(data, tiffStart)
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

  return ordered
}

export function bufferToUint8Array(buffer: ArrayBuffer): Uint8Array {
  return new Uint8Array(buffer)
}
