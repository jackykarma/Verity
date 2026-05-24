import type { ReadableField } from '../shared/types/present.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'

export interface ThumbnailInfo {
  /** 缩略图 JPEG 在整文件中的绝对偏移 */
  fileOffset: number
  /** TIFF IFD1 内 JPEGInterchangeFormat (0x0201) */
  tiffOffset: number
  length: number
  compression: number | null
  compressionLabel: string | null
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
export function findExifTiffStart(data: Uint8Array): number {
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

export function compressionLabel(code: number | null | undefined): string | null {
  if (code == null) {
    return null
  }
  return EXIF_COMPRESSION[code] ?? `Compression ${code}`
}

export function buildThumbnailReadableFields(info: ThumbnailInfo): ReadableField[] {
  return [
    { key: 'Compression', value: info.compressionLabel ?? '—' },
    {
      key: 'JPEGInterchangeFormat (ThumbnailOffset)',
      value: `${info.tiffOffset} (TIFF 相对) · ${formatByteOffset(info.fileOffset)} (文件内)`,
    },
    { key: 'JPEGInterchangeFormatLength (ThumbnailLength)', value: `${info.length} 字节` },
    {
      key: 'ThumbnailImage',
      value: info.jpegBytes ? `嵌入 JPEG ${info.jpegBytes.byteLength} 字节` : '（无法解码）',
    },
  ]
}

export async function extractThumbnailInfo(fullBuffer: ArrayBuffer): Promise<ThumbnailInfo | null> {
  const data = new Uint8Array(fullBuffer)
  const tiffStart = findExifTiffStart(data)
  if (tiffStart < 0) {
    return null
  }

  const exifr = (await import('exifr')).default
  try {
    const parsed = (await exifr.parse(fullBuffer, {
      tiff: true,
      mergeOutput: false,
      ifd0: true,
      exif: true,
    })) as {
      ifd1?: {
        Compression?: number
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

    if (!jpegBytes && length > 0 && fileOffset > 0 && fileOffset + length <= data.length) {
      const slice = data.slice(fileOffset, fileOffset + length)
      if (slice[0] === 0xff && slice[1] === 0xd8) {
        return {
          fileOffset,
          tiffOffset: resolvedTiffOffset,
          length,
          compression: ifd1?.Compression ?? null,
          compressionLabel: compressionLabel(ifd1?.Compression),
          jpegBytes: slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength),
        }
      }
    }

    if (!jpegBytes && length <= 0) {
      return null
    }

    return {
      fileOffset: fileOffset > 0 ? fileOffset : 0,
      tiffOffset: resolvedTiffOffset,
      length: length || jpegBytes?.byteLength || 0,
      compression: ifd1?.Compression ?? null,
      compressionLabel: compressionLabel(ifd1?.Compression),
      jpegBytes,
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
