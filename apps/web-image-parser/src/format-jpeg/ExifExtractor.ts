import exifr from 'exifr'
import { formatByteOffset } from '../shared/formatUtils.ts'
import type { ReadableField, ReadablePayload } from '../shared/types/present.ts'
import { bufferToUint8Array, collectOrderedIfdTags, type IfdBlockKey, type OrderedIfdTag } from './TiffIfdWalker.ts'

const EXIF_SPEC = 'https://exiftool.org/TagNames/EXIF.html'

/** 常见 EXIF 字段中文标签；未列出的保留 ExifTool 英文名 */
const EXIF_TAG_LABELS: Record<string, string> = {
  Make: 'Make (相机厂商)',
  Model: 'Model (相机型号)',
  Orientation: 'Orientation (方向)',
  ImageDescription: 'ImageDescription (图像描述)',
  Software: 'Software (软件)',
  Artist: 'Artist (作者)',
  Copyright: 'Copyright (版权)',
  DateTime: 'DateTime (修改时间)',
  DateTimeOriginal: 'DateTimeOriginal (拍摄时间)',
  DateTimeDigitized: 'DateTimeDigitized (数字化时间)',
  UserComment: 'UserComment (用户注释)',
  ExposureTime: 'ExposureTime (曝光时间)',
  FNumber: 'FNumber (光圈)',
  ISO: 'ISO',
  ISOSpeedRatings: 'ISOSpeedRatings (ISO)',
  FocalLength: 'FocalLength (焦距)',
  LensModel: 'LensModel (镜头)',
  Flash: 'Flash (闪光灯)',
  WhiteBalance: 'WhiteBalance (白平衡)',
  MeteringMode: 'MeteringMode (测光模式)',
  ExposureProgram: 'ExposureProgram (曝光程序)',
  ExposureMode: 'ExposureMode (曝光模式)',
  SceneCaptureType: 'SceneCaptureType (场景类型)',
  GPSLatitude: 'GPSLatitude (纬度)',
  GPSLongitude: 'GPSLongitude (经度)',
  GPSAltitude: 'GPSAltitude (高度)',
  GPSLatitudeRef: 'GPSLatitudeRef',
  GPSLongitudeRef: 'GPSLongitudeRef',
  ImageWidth: 'ImageWidth (图像宽度)',
  ImageHeight: 'ImageHeight (图像高度)',
  ExifImageWidth: 'ExifImageWidth',
  ExifImageHeight: 'ExifImageHeight',
  ColorSpace: 'ColorSpace (色彩空间)',
  ComponentsConfiguration: 'ComponentsConfiguration',
  InteropIndex: 'InteropIndex',
  InteropVersion: 'InteropVersion',
}


/** UserComment (0x9286) 解码 — EXIF 规范 8 字节字符集 + 正文 */
export function decodeUserComment(value: unknown): string {
  if (value == null) {
    return ''
  }
  if (typeof value === 'string') {
    return value.trim() || '（空）'
  }

  const bytes =
    value instanceof Uint8Array
      ? value
      : value instanceof ArrayBuffer
        ? new Uint8Array(value)
        : null

  if (!bytes || bytes.length === 0) {
    return String(value)
  }

  if (bytes.length >= 8) {
    const charset = new TextDecoder('ascii').decode(bytes.slice(0, 8)).replace(/\0/g, '').trim()
    const body = bytes.slice(8)

    if (charset.startsWith('ASCII')) {
      return new TextDecoder('ascii').decode(body).replace(/\0+$/, '').trim() || '（空）'
    }
    if (charset.startsWith('UNICODE')) {
      const text = new TextDecoder('utf-16be').decode(body).replace(/\0+$/, '').trim()
      return text || '（空）'
    }
    if (charset.startsWith('JIS')) {
      return `[JIS] ${new TextDecoder('latin1').decode(body).replace(/\0+$/, '').trim()}`
    }
  }

  return new TextDecoder('utf-8', { fatal: false }).decode(bytes).replace(/\0+$/, '').trim() || '（空）'
}

function formatExifValue(key: string, value: unknown): string {
  if (key === 'UserComment' || key.endsWith('.UserComment')) {
    return decodeUserComment(value)
  }
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (value instanceof Uint8Array) {
    if (value.length <= 64) {
      return `[${value.length} bytes] ${[...value].map((b) => b.toString(16).padStart(2, '0')).join(' ')}`
    }
    return `[${value.length} bytes] ${[...value.slice(0, 32)].map((b) => b.toString(16).padStart(2, '0')).join(' ')} …`
  }
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).join(', ')
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value)
}

function fieldLabel(key: string): string {
  return EXIF_TAG_LABELS[key] ?? key
}

function hasNonZeroBytes(bytes: Uint8Array): boolean {
  return bytes.some((b) => b !== 0)
}

/** exifr 在 mergeOutput:false 时将 UserComment 放在独立块 parsed.userComment（非 exif 内） */
export function extractUserCommentField(parsed: Record<string, unknown>): ReadableField | null {
  const raw = parsed.userComment

  if (raw instanceof Uint8Array) {
    if (!hasNonZeroBytes(raw)) {
      return null
    }
    const text = decodeUserComment(raw)
    return text && text !== '（空）' ? { key: 'ExifIFD · UserComment', value: text } : null
  }

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const inner = (raw as Record<string, unknown>).UserComment ?? (raw as Record<string, unknown>).value
    if (inner != null) {
      const text = decodeUserComment(inner)
      return text && text !== '（空）' ? { key: 'ExifIFD · UserComment', value: text } : null
    }
  }

  const exif = parsed.exif
  if (exif && typeof exif === 'object' && !Array.isArray(exif)) {
    const fromExif = (exif as Record<string, unknown>).UserComment
    if (fromExif != null) {
      const text = decodeUserComment(fromExif)
      return text && text !== '（空）' ? { key: 'ExifIFD · UserComment', value: text } : null
    }
  }

  return null
}

const IFD_FALLBACK_GROUPS: { blockKey: IfdBlockKey; label: string }[] = [
  { blockKey: 'ifd0', label: 'IFD0' },
  { blockKey: 'exif', label: 'ExifIFD' },
  { blockKey: 'gps', label: 'GPS IFD' },
  { blockKey: 'interop', label: 'InteropIFD' },
]

function fallbackBlockFields(parsed: Record<string, unknown>): ReadableField[] {
  const fields: ReadableField[] = []
  for (const { blockKey, label } of IFD_FALLBACK_GROUPS) {
    const block = parsed[blockKey]
    if (block && typeof block === 'object' && !Array.isArray(block)) {
      fields.push(...flattenIfdBlock(block as Record<string, unknown>, label))
    }
  }
  const uc = extractUserCommentField(parsed)
  if (uc && !fields.some((f) => f.key.includes('UserComment'))) {
    fields.push(uc)
  }
  return fields
}

function lookupTagValue(parsed: Record<string, unknown>, tag: OrderedIfdTag): unknown | undefined {
  if (tag.tagName === 'UserComment') {
    const raw = parsed.userComment
    if (raw instanceof Uint8Array) {
      return raw
    }
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      return (raw as Record<string, unknown>).UserComment ?? (raw as Record<string, unknown>).value
    }
  }

  const block = parsed[tag.blockKey]
  if (block && typeof block === 'object' && !Array.isArray(block)) {
    return (block as Record<string, unknown>)[tag.tagName]
  }
  return undefined
}

function orderedFieldsFromParsed(
  parsed: Record<string, unknown>,
  data: Uint8Array,
): ReadableField[] {
  const orderedTags = collectOrderedIfdTags(data)
  if (orderedTags.length === 0) {
    return []
  }

  const fields: ReadableField[] = []
  const seen = new Set<string>()

  for (const tag of orderedTags) {
    const dedupeKey = `${tag.blockKey}:${tag.tagId}`
    if (seen.has(dedupeKey)) {
      continue
    }
    seen.add(dedupeKey)

    const raw = lookupTagValue(parsed, tag)
    if (raw === undefined || raw === null) {
      continue
    }

    if (tag.tagName === 'UserComment' && raw instanceof Uint8Array && !hasNonZeroBytes(raw)) {
      continue
    }

    const value = formatExifValue(tag.tagName, raw)
    if (tag.tagName === 'UserComment' && (value === '（空）' || !value)) {
      continue
    }

    fields.push({
      key: `${tag.groupLabel} · ${tag.tagName}`,
      value,
    })
  }

  return fields
}

function flattenIfdBlock(block: Record<string, unknown>, groupPrefix: string): ReadableField[] {
  const fields: ReadableField[] = []
  for (const [key, value] of Object.entries(block)) {
    if (value === undefined || value === null) {
      continue
    }
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Uint8Array)) {
      continue
    }
    fields.push({
      key: `${groupPrefix} · ${key}`,
      value: formatExifValue(key, value),
    })
  }
  return fields
}

function flattenMergedExif(data: Record<string, unknown>): ReadableField[] {
  const fields: ReadableField[] = []
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) {
      continue
    }
    if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date) && !(value instanceof Uint8Array)) {
      continue
    }
    fields.push({ key: fieldLabel(key), value: formatExifValue(key, value) })
  }
  return fields
}

const EXIF_PARSE_OPTIONS = {
  tiff: true,
  ifd0: true,
  exif: true,
  gps: true,
  interop: true,
  /** UserComment (0x9286) 默认不开启，须显式打开 */
  userComment: true,
  mergeOutput: false,
  reviveValues: true,
  translateKeys: true,
  translateValues: true,
  makerNote: false,
  iptc: false,
} as const

export async function extractExifFields(
  app1Slice: ArrayBuffer,
  fullBuffer?: ArrayBuffer,
): Promise<ReadableField[]> {
  const candidates =
    fullBuffer && fullBuffer.byteLength > 0 ? [fullBuffer, app1Slice] : [app1Slice]

  for (const buf of candidates) {
    const data = bufferToUint8Array(buf)

    try {
      const parsed = (await exifr.parse(buf, EXIF_PARSE_OPTIONS)) as Record<string, unknown> | null
      if (!parsed || typeof parsed !== 'object') {
        continue
      }

      const fields = orderedFieldsFromParsed(parsed, data)
      if (fields.length > 0) {
        return fields
      }

      const fallback = fallbackBlockFields(parsed)
      if (fallback.length > 0) {
        return fallback
      }
    } catch {
      // try next candidate
    }

    try {
      const merged = (await exifr.parse(buf, {
        ...EXIF_PARSE_OPTIONS,
        mergeOutput: true,
      })) as Record<string, unknown> | null
      if (merged && typeof merged === 'object') {
        const fallback = flattenMergedExif(merged)
        if (fallback.length > 0) {
          return fallback
        }
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
  thumbnailFields?: ReadableField[],
): Promise<ReadablePayload> {
  return extractExifFields(app1Slice, fullBuffer).then((fields) => {
    const merged = [
      { key: 'ExifTool Tag ID', value: 'APP1' },
      { key: 'ExifTool Tag Name', value: 'EXIF' },
      { key: 'ExifTool 规范', value: EXIF_SPEC },
      ...fields,
      ...(thumbnailFields ?? []),
    ]
    return {
      title: 'EXIF 元数据',
      fields: merged.length > 3 ? merged : [{ key: '提示', value: '无可用 EXIF 字段' }],
    }
  })
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
  payload: ReadablePayload,
  slice: ArrayBuffer,
  maxBytes = 256,
): ReadablePayload {
  return {
    ...payload,
    hexPreview: hexPreview(slice, maxBytes),
  }
}
