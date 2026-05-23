import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'

export interface ThumbnailInfo {
  offset: number
  length: number
  jpegBytes: ArrayBuffer | null
}

function toArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) {
    return data
  }
  return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
}

export async function extractThumbnailInfo(source: ArrayBuffer): Promise<ThumbnailInfo | null> {
  const exifr = (await import('exifr')).default
  try {
    const parsed = (await exifr.parse(source, {
      tiff: true,
      exif: true,
      mergeOutput: false,
    })) as { ifd1?: { ThumbnailOffset?: number; ThumbnailLength?: number } } | null

    const ifd1 = parsed?.ifd1
    const thumb = await exifr.thumbnail(source).catch(() => null)

    if (!ifd1?.ThumbnailOffset || !ifd1?.ThumbnailLength) {
      if (thumb) {
        return {
          offset: 0,
          length: thumb.byteLength,
          jpegBytes: toArrayBuffer(thumb),
        }
      }
      return null
    }

    return {
      offset: ifd1.ThumbnailOffset,
      length: ifd1.ThumbnailLength,
      jpegBytes: thumb ? toArrayBuffer(thumb) : null,
    }
  } catch {
    return null
  }
}

export function appendThumbnailNode(
  nodes: SegmentNodeDto[],
  parentNodeId: string,
  parentOffset: number,
  thumb: ThumbnailInfo,
  index: number,
): void {
  nodes.push({
    id: `exif-thumb-${index}`,
    parentId: parentNodeId,
    label: 'EXIF 缩略图',
    parCatalogId: 'PAR-JPEG-025',
    offset: parentOffset + thumb.offset,
    length: thumb.length,
    loadType: 'image',
    warning: false,
  })
}
