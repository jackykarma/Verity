/** ExifTool EXIF 表内 exifr 未收录的标签名（含 Microsoft 0x5001–0x5113 段） */
export const EXIF_SUPPLEMENT_TAG_NAMES: ReadonlyMap<number, string> = new Map([
  [0x5010, 'JPEGQuality'],
  [0x5011, 'GridSize'],
  [0x5012, 'ThumbnailFormat'],
  [0x5013, 'ThumbnailWidth'],
  [0x5014, 'ThumbnailHeight'],
  [0x5015, 'ThumbnailColorDepth'],
  [0x5016, 'ThumbnailPlanes'],
  [0x5017, 'ThumbnailRawBytes'],
  [0x5018, 'ThumbnailLength'],
  [0x5019, 'ThumbnailCompressedSize'],
  [0x501b, 'ThumbnailData'],
  [0x5020, 'ThumbnailImageWidth'],
  [0x5021, 'ThumbnailImageHeight'],
  [0x5023, 'ThumbnailCompression'],
])

/** @see https://exiftool.org/TagNames/EXIF.html — ThumbnailFormat 常见取值 */
export const THUMBNAIL_FORMAT_LABELS: Record<number, string> = {
  0: 'Raw RGB',
  1: 'JPEG',
  2: 'RGB TIFF',
}

export function supplementTagName(tagId: number): string | undefined {
  return EXIF_SUPPLEMENT_TAG_NAMES.get(tagId)
}

export function formatThumbnailFormat(code: number): string {
  return THUMBNAIL_FORMAT_LABELS[code] ?? String(code)
}
