import type { ReadableField } from '../shared/types/present.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'
import { formatThumbnailFormat } from './exifTagSupplement.ts'
import {
  isTiffLittleEndian,
  readIfdTagRawValue,
  readU16,
  readU32,
} from './TiffIfdWalker.ts'

export interface ThumbnailInfo {
  /** 缩略图 JPEG 在整文件中的绝对偏移 */
  fileOffset: number
  /** TIFF IFD1 内 JPEGInterchangeFormat (0x0201) */
  tiffOffset: number
  length: number
  compression: number | null
  compressionLabel: string | null
  /** IFD1 ImageWidth (0x0100) 或 Microsoft ThumbnailWidth (0x5013) */
  thumbnailWidth: number | null
  /** IFD1 ImageHeight (0x0101) 或 Microsoft ThumbnailHeight (0x5014) */
  thumbnailHeight: number | null
  /** Microsoft ThumbnailFormat (0x5012) */
  thumbnailFormat: number | null
  thumbnailFormatLabel: string | null
  jpegBytes: ArrayBuffer | null
}

/** @see https://exiftool.org/TagNames/EXIF.html — EXIF Compression */
const EXIF_COMPRESSION: Record<number, string> = {
  1: 'Uncompressed',
  6: 'JPEG (old-style)',
  7: 'JPEG',
  8: 'Adobe Deflate',
  34712: 'JPEG 2000',
}

function toArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) {
    return data
  }
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
}

function readAscii(data: Uint8Array, offset: number, maxLen: number): string {
  let out = ''
  for (let i = 0; i < maxLen && offset + i < data.length; i++) {
    const c = data[offset + i]
    if (c === undefined || c === 0) {
      break
    }
    out += String.fromCharCode(c)
  }
  return out
}

/** 定位主 EXIF APP1 中 TIFF 头起始（相对整文件）。 */
export function findExifTiffStartInFile(data: Uint8Array): number {
  for (let i = 0; i < data.length - 12; i++) {
    if (data[i] !== 0xff || data[i + 1] !== 0xe1) {
      continue
    }
    const payloadStart = i + 4
    if (readAscii(data, payloadStart, 4) !== 'Exif') {
      continue
    }
    if (readAscii(data, payloadStart, 6) === 'Exif') {
      return payloadStart + 6
    }
  }
  return -1
}

/** @deprecated 使用 findExifTiffStartInFile */
export const findExifTiffStart = findExifTiffStartInFile

export function compressionLabel(code: number | null | undefined): string | null {
  if (code == null) {
    return null
  }
  return EXIF_COMPRESSION[code] ?? `Compression ${code}`
}

/** 从嵌入 JPEG SOF 段读取宽高 */
export function readJpegDimensions(data: Uint8Array): { width: number; height: number } | null {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) {
    return null
  }

  let i = 2
  while (i + 9 < data.length) {
    if (data[i] !== 0xff) {
      i++
      continue
    }
    const marker = data[i + 1]!
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const height = (data[i + 5]! << 8) | data[i + 6]!
      const width = (data[i + 7]! << 8) | data[i + 8]!
      return { width, height }
    }
    if (marker === 0xd9) {
      break
    }
    const segLen = (data[i + 2]! << 8) | data[i + 3]!
    i += 2 + segLen
  }
  return null
}

function readIfd1Offset(data: Uint8Array, tiffStart: number, le: boolean): number | null {
  const ifd0Offset = readU32(data, tiffStart + 4, le)
  const ifd0Abs = tiffStart + ifd0Offset
  const count = readU16(data, ifd0Abs, le)
  const nextPtr = ifd0Abs + 2 + count * 12
  if (nextPtr + 4 > data.length) {
    return null
  }
  const ifd1 = readU32(data, nextPtr, le)
  return ifd1 > 0 ? ifd1 : null
}

function readThumbnailDimensionsFromTiff(data: Uint8Array, tiffStart: number): {
  thumbnailWidth: number | null
  thumbnailHeight: number | null
  thumbnailFormat: number | null
} {
  const le = isTiffLittleEndian(data, tiffStart)
  const ifd0Offset = readU32(data, tiffStart + 4, le)

  const msFormat = readIfdTagRawValue(data, tiffStart, ifd0Offset, 0x5012, le)
  const msWidth = readIfdTagRawValue(data, tiffStart, ifd0Offset, 0x5013, le)
  const msHeight = readIfdTagRawValue(data, tiffStart, ifd0Offset, 0x5014, le)

  const ifd1Offset = readIfd1Offset(data, tiffStart, le)
  let ifd1Width: unknown
  let ifd1Height: unknown
  if (ifd1Offset != null) {
    ifd1Width = readIfdTagRawValue(data, tiffStart, ifd1Offset, 0x0100, le)
    ifd1Height = readIfdTagRawValue(data, tiffStart, ifd1Offset, 0x0101, le)
  }

  const toNum = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null

  return {
    thumbnailFormat: toNum(msFormat),
    thumbnailWidth: toNum(ifd1Width) ?? toNum(msWidth),
    thumbnailHeight: toNum(ifd1Height) ?? toNum(msHeight),
  }
}

export function buildThumbnailReadableFields(info: ThumbnailInfo): ReadableField[] {
  const fields: ReadableField[] = []

  if (info.compressionLabel != null) {
    fields.push({ key: 'IFD1 · Compression', value: info.compressionLabel })
  }

  if (info.thumbnailFormat != null) {
    fields.push({
      key: 'IFD0 · ThumbnailFormat',
      value: info.thumbnailFormatLabel ?? formatThumbnailFormat(info.thumbnailFormat),
    })
  }

  if (info.thumbnailWidth != null) {
    const widthKey =
      info.thumbnailFormat != null ? 'IFD0 · ThumbnailWidth' : 'IFD1 · ImageWidth'
    fields.push({ key: widthKey, value: String(info.thumbnailWidth) })
  }

  if (info.thumbnailHeight != null) {
    const heightKey =
      info.thumbnailFormat != null ? 'IFD0 · ThumbnailHeight' : 'IFD1 · ImageHeight'
    fields.push({ key: heightKey, value: String(info.thumbnailHeight) })
  }

  fields.push({
    key: 'IFD1 · JPEGInterchangeFormat (ThumbnailOffset)',
    value: `${info.tiffOffset} (TIFF 相对) · ${formatByteOffset(info.fileOffset)} (文件内)`,
  })
  fields.push({
    key: 'IFD1 · JPEGInterchangeFormatLength (ThumbnailLength)',
    value: `${info.length} 字节`,
  })
  fields.push({
    key: 'IFD1 · ThumbnailImage',
    value: info.jpegBytes ? `嵌入 JPEG ${info.jpegBytes.byteLength} 字节` : '（无法解码）',
  })

  return fields
}

export async function extractThumbnailInfo(fullBuffer: ArrayBuffer): Promise<ThumbnailInfo | null> {
  const data = new Uint8Array(fullBuffer)
  const tiffStart = findExifTiffStartInFile(data)
  if (tiffStart < 0) {
    return null
  }

  const dimHints = readThumbnailDimensionsFromTiff(data, tiffStart)

  const exifr = (await import('exifr')).default
  try {
    const parsed = (await exifr.parse(fullBuffer, {
      tiff: true,
      mergeOutput: false,
      ifd0: true,
      ifd1: true,
      exif: true,
    })) as {
      ifd1?: {
        Compression?: number
        ImageWidth?: number
        ImageHeight?: number
        ThumbnailOffset?: number
        ThumbnailLength?: number
      }
    } | null

    const ifd1 = parsed?.ifd1
    const thumb = await exifr.thumbnail(fullBuffer).catch(() => null)
    const jpegBytes = thumb ? toArrayBuffer(thumb) : null

    const tiffOffset = ifd1?.ThumbnailOffset
    const length = ifd1?.ThumbnailLength ?? jpegBytes?.byteLength ?? 0

    if (!tiffOffset && !jpegBytes) {
      return null
    }

    const resolvedTiffOffset = tiffOffset ?? 0
    const fileOffset =
      tiffOffset != null && tiffOffset > 0
        ? tiffStart + tiffOffset
        : jpegBytes
          ? findJpegSoiInBuffer(data, tiffStart)
          : 0

    let finalJpeg = jpegBytes
    if (!finalJpeg && length > 0 && fileOffset > 0 && fileOffset + length <= data.length) {
      const slice = data.slice(fileOffset, fileOffset + length)
      if (slice[0] === 0xff && slice[1] === 0xd8) {
        finalJpeg = slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength) as ArrayBuffer
      }
    }

    if (!finalJpeg && length <= 0) {
      return null
    }

    const jpegDims = finalJpeg ? readJpegDimensions(new Uint8Array(finalJpeg)) : null
    const thumbnailWidth =
      ifd1?.ImageWidth ?? dimHints.thumbnailWidth ?? jpegDims?.width ?? null
    const thumbnailHeight =
      ifd1?.ImageHeight ?? dimHints.thumbnailHeight ?? jpegDims?.height ?? null
    const thumbnailFormat = dimHints.thumbnailFormat

    return {
      fileOffset: fileOffset > 0 ? fileOffset : 0,
      tiffOffset: resolvedTiffOffset,
      length: length || finalJpeg?.byteLength || 0,
      compression: ifd1?.Compression ?? null,
      compressionLabel: compressionLabel(ifd1?.Compression),
      thumbnailWidth,
      thumbnailHeight,
      thumbnailFormat,
      thumbnailFormatLabel:
        thumbnailFormat != null ? formatThumbnailFormat(thumbnailFormat) : null,
      jpegBytes: finalJpeg,
    }
  } catch {
    return null
  }
}

function findJpegSoiInBuffer(data: Uint8Array, searchFrom: number): number {
  for (let i = searchFrom; i < data.length - 1; i++) {
    if (data[i] === 0xff && data[i + 1] === 0xd8) {
      return i
    }
  }
  return 0
}

export function appendThumbnailNode(
  nodes: import('../shared/types/parseMessages.ts').SegmentNodeDto[],
  parentNodeId: string,
  thumb: ThumbnailInfo,
  index: number,
): void {
  nodes.push({
    id: `exif-thumb-${index}`,
    parentId: parentNodeId,
    label: 'EXIF 缩略图 (ThumbnailImage)',
    parCatalogId: 'PAR-JPEG-025',
    offset: thumb.fileOffset,
    length: thumb.length,
    loadType: 'image',
    warning: !thumb.jpegBytes,
  })
}

export function buildExifThumbnailGallery(
  thumb: ThumbnailInfo,
  sessionId: string,
): import('../shared/types/present.ts').GalleryImage[] {
  if (!thumb.jpegBytes || thumb.jpegBytes.byteLength < 4) {
    return []
  }

  const url = URL.createObjectURL(new Blob([thumb.jpegBytes], { type: 'image/jpeg' }))
  return [
    {
      label: 'EXIF 缩略图 (ThumbnailImage)',
      alt: 'EXIF ThumbnailImage',
      src: url,
      contentRef: {
        kind: 'byteRange',
        sessionId,
        offset: thumb.fileOffset,
        length: thumb.length,
      },
    },
  ]
}
