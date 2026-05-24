import exifr from 'exifr'
import { formatByteOffset } from '../shared/formatUtils.ts'
import type { ReadableField, ReadablePayload } from '../shared/types/present.ts'

const EXIF_TAGS: Record<string, string> = {
  Make: '相机厂商',
  Model: '相机型号',
  Orientation: '方向',
  DateTimeOriginal: '拍摄时间',
  ExposureTime: '曝光时间',
  FNumber: '光圈',
  ISO: 'ISO',
  FocalLength: '焦距',
  LensModel: '镜头',
  GPSLatitude: '纬度',
  GPSLongitude: '经度',
  GPSAltitude: '高度',
  ImageWidth: '图像宽度',
  ImageHeight: '图像高度',
}

function flattenExif(data: Record<string, unknown>, prefix = ''): ReadableField[] {
  const fields: ReadableField[] = []
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue
    }
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      fields.push(...flattenExif(value as Record<string, unknown>, `${prefix}${key}.`))
      continue
    }
    const label = EXIF_TAGS[key] ?? key
    fields.push({ key: prefix ? `${prefix}${label}` : label, value: String(value) })
  }
  return fields
}

export async function extractExifFields(
  app1Slice: ArrayBuffer,
  fullBuffer?: ArrayBuffer,
): Promise<ReadableField[]> {
  const candidates = fullBuffer && fullBuffer.byteLength > 0 ? [app1Slice, fullBuffer] : [app1Slice]
  const options = {
    iptc: true,
    mergeOutput: true,
    reviveValues: true,
    tiff: true,
    ifd0: true,
    exif: true,
    gps: true,
  } as const

  for (const buf of candidates) {
    try {
      const parsed = await exifr.parse(buf, options)
      if (!parsed || typeof parsed !== 'object') {
        continue
      }
      const fields = flattenExif(parsed as Record<string, unknown>)
      if (fields.length > 0) {
        return fields
      }
    } catch {
      // try next candidate
    }
  }

  return [{ key: 'EXIF', value: '无法解析 EXIF 数据' }]
}

export function buildExifReadable(
  app1Slice: ArrayBuffer,
  fullBuffer?: ArrayBuffer,
): Promise<ReadablePayload> {
  return extractExifFields(app1Slice, fullBuffer).then((fields) => ({
    title: 'EXIF 元数据',
    fields: fields.length > 0 ? fields : [{ key: '提示', value: '无可用 EXIF 字段' }],
  }))
}

export function buildComReadable(text: string): ReadablePayload {
  return {
    title: 'COM 注释',
    fields: [{ key: '内容', value: text || '（空）' }],
  }
}

export function hexPreview(buffer: ArrayBuffer, maxBytes = 256): string {
  const total = buffer.byteLength
  const cap = Math.min(total, maxBytes)
  const bytes = new Uint8Array(buffer.slice(0, cap))
  const lines: string[] = []

  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16)
    const hex = [...chunk].map((b) => b.toString(16).padStart(2, '0')).join(' ')
    const addr = formatByteOffset(i)
    lines.push(`${addr}  ${hex}`)
  }

  if (total > cap) {
    lines.push(`… 共 ${total} 字节，已显示前 ${cap} 字节`)
  }

  return lines.join('\n')
}

export function attachSegmentHex(
  payload: import('../shared/types/present.ts').ReadablePayload,
  slice: ArrayBuffer,
  maxBytes = 256,
): import('../shared/types/present.ts').ReadablePayload {
  return {
    ...payload,
    hexPreview: hexPreview(slice, maxBytes),
  }
}
