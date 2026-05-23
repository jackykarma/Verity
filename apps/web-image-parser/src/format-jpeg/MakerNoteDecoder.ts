import exifr from 'exifr'
import type { ReadableField } from '../shared/types/present.ts'

/** 标准 EXIF IFD0/Exif/GPS 常见 Tag（非 MakerNote 专有） */
const STANDARD_EXIF_KEYS = new Set([
  'Make',
  'Model',
  'Orientation',
  'XResolution',
  'YResolution',
  'ResolutionUnit',
  'Software',
  'ModifyDate',
  'YCbCrPositioning',
  'ExposureTime',
  'FNumber',
  'ExposureProgram',
  'ISO',
  'ExifVersion',
  'DateTimeOriginal',
  'CreateDate',
  'ComponentsConfiguration',
  'ShutterSpeedValue',
  'ApertureValue',
  'ExposureCompensation',
  'MeteringMode',
  'Flash',
  'FocalLength',
  'SubSecTime',
  'SubSecTimeOriginal',
  'SubSecTimeDigitized',
  'FlashpixVersion',
  'ColorSpace',
  'ExifImageWidth',
  'ExifImageHeight',
  'FocalPlaneXResolution',
  'FocalPlaneYResolution',
  'FocalPlaneResolutionUnit',
  'GPSVersionID',
  'GPSLatitude',
  'GPSLongitude',
  'GPSAltitude',
  'GPSLatitudeRef',
  'GPSLongitudeRef',
  'GPSAltitudeRef',
  'ImageWidth',
  'ImageHeight',
  'InteropIndex',
  'InteropVersion',
  'LensModel',
  'LensMake',
  'DateTime',
  'Artist',
  'Copyright',
  'UserComment',
])

const KNOWN_VENDORS = new Set([
  'Canon',
  'NIKON CORPORATION',
  'Nikon',
  'SONY',
  'Apple',
  'FUJIFILM',
  'Fujifilm',
  'Panasonic',
  'PENTAX',
  'Olympus',
  'Leica',
  'Samsung',
  'Hasselblad',
  'Minolta',
  'Sigma',
])

export interface MakerNoteResult {
  vendor: string
  fields: ReadableField[]
  supported: boolean
  hexFallback?: string
}

function formatValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString()
  }
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    return `[二进制 ${value.byteLength ?? (value as Uint8Array).length} 字节]`
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value)
}

export async function decodeMakerNote(
  app1Slice: ArrayBuffer,
  fullBuffer?: ArrayBuffer,
): Promise<MakerNoteResult> {
  const candidates = fullBuffer && fullBuffer.byteLength > 0 ? [app1Slice, fullBuffer] : [app1Slice]

  for (const buf of candidates) {
    try {
      const merged = (await exifr.parse(buf, {
        makerNote: true,
        mergeOutput: true,
        reviveValues: true,
      })) as Record<string, unknown> | undefined

      if (!merged) {
        continue
      }

      const make = String(merged.Make ?? '未知厂商')
      const makerFields: ReadableField[] = [{ key: '厂商', value: make }]

      for (const [key, value] of Object.entries(merged)) {
        if (STANDARD_EXIF_KEYS.has(key)) {
          continue
        }
        if (value === undefined || value === null) {
          continue
        }
        makerFields.push({ key, value: formatValue(value) })
      }

      const vendorKnown = [...KNOWN_VENDORS].some((v) => make.toUpperCase().includes(v.toUpperCase()))
      const supported = vendorKnown && makerFields.length > 1

      if (!supported && makerFields.length <= 1) {
        const bytes = new Uint8Array(buf)
        const hex = [...bytes.slice(0, 64)].map((b) => b.toString(16).padStart(2, '0')).join(' ')
        return {
          vendor: make,
          fields: [
            { key: '厂商', value: make },
            { key: '说明', value: '字段级解析不支持，以下为原始块摘要' },
          ],
          supported: false,
          hexFallback: hex,
        }
      }

      return { vendor: make, fields: makerFields, supported }
    } catch {
      continue
    }
  }

  return {
    vendor: '未知',
    fields: [{ key: '说明', value: 'MakerNote 解析失败' }],
    supported: false,
  }
}

export function buildMakerNoteReadable(result: MakerNoteResult): {
  title: string
  fields: ReadableField[]
  hexPreview?: string
} {
  return {
    title: `MakerNote（${result.vendor}）`,
    fields: result.fields,
    hexPreview: result.hexFallback,
  }
}
