import type { ReadableField } from '../shared/types/present.ts'

const RESOLUTION_UNIT: Record<number, string> = {
  0: 'None',
  1: 'inches',
  2: 'cm',
}

const JFXX_EXTENSION: Record<number, string> = {
  0x10: 'ThumbnailImage (JPEG)',
  0x11: 'ThumbnailTIFF (palette-color)',
  0x13: 'ThumbnailTIFF (RGB)',
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

function readU16Be(data: Uint8Array, offset: number): number {
  return (data[offset]! << 8) | data[offset + 1]!
}

/** 解析 APP0 JFIF / JFXX payload（不含 APP 标记与长度字段） */
export function parseJfifPayload(data: Uint8Array, payloadStart: number, payloadLength: number): ReadableField[] {
  const fields: ReadableField[] = []
  const id = readAscii(data, payloadStart, 5)

  if (id === 'JFIF') {
    fields.push(...parseJfifHeader(data, payloadStart, payloadLength))
    return fields
  }

  if (id === 'JFXX') {
    fields.push({ key: 'Identifier', value: 'JFXX' })
    if (payloadStart + 6 <= data.length) {
      const extCode = data[payloadStart + 5] ?? 0
      fields.push({
        key: 'ExtensionCode',
        value: JFXX_EXTENSION[extCode] ?? `0x${extCode.toString(16)}`,
      })
      const extDataLen = payloadLength - 6
      if (extDataLen > 0) {
        fields.push({ key: 'ExtensionDataLength', value: `${extDataLen} 字节` })
      }
      if (extCode === 0x10) {
        fields.push({ key: 'ThumbnailImage', value: extDataLen > 0 ? '嵌入 JPEG 缩略图' : '（空）' })
      } else if (extCode === 0x11 || extCode === 0x13) {
        fields.push({
          key: 'ThumbnailTIFF',
          value: extDataLen > 0 ? `原始 RGB/调色板数据 ${extDataLen} 字节` : '（空）',
        })
      }
    }
    return fields
  }

  fields.push({ key: 'Identifier', value: id || '（未知）' })
  return fields
}

function parseJfifHeader(data: Uint8Array, start: number, payloadLength: number): ReadableField[] {
  const fields: ReadableField[] = [{ key: 'Identifier', value: 'JFIF' }]

  if (start + 13 >= data.length || payloadLength < 14) {
    fields.push({ key: '提示', value: 'JFIF 头不完整（至少需要 14 字节 payload）' })
    return fields
  }

  const major = data[start + 5] ?? 0
  const minor = data[start + 6] ?? 0
  fields.push({ key: 'JFIFVersion', value: `${major}.${minor}` })

  const unit = data[start + 7] ?? 0
  fields.push({
    key: 'ResolutionUnit',
    value: RESOLUTION_UNIT[unit] ?? String(unit),
  })

  const xRes = readU16Be(data, start + 8)
  const yRes = readU16Be(data, start + 10)
  fields.push({ key: 'XResolution', value: String(xRes) })
  fields.push({ key: 'YResolution', value: String(yRes) })

  const thumbW = data[start + 12] ?? 0
  const thumbH = data[start + 13] ?? 0
  fields.push({ key: 'ThumbnailWidth', value: String(thumbW) })
  fields.push({ key: 'ThumbnailHeight', value: String(thumbH) })

  if (thumbW > 0 && thumbH > 0) {
    const thumbBytes = thumbW * thumbH * 3
    const available = Math.min(thumbBytes, payloadLength - 14, data.length - (start + 14))
    fields.push({
      key: 'ThumbnailTIFF',
      value:
        available >= thumbBytes
          ? `嵌入 RGB 缩略图 ${thumbBytes} 字节（${thumbW}×${thumbH}）`
          : `RGB 缩略图不完整：期望 ${thumbBytes} 字节，可用 ${Math.max(0, available)} 字节`,
    })
  } else {
    fields.push({ key: 'ThumbnailTIFF', value: '（无嵌入缩略图）' })
  }

  return fields
}

export function extractJfifFromSegment(data: Uint8Array, segOffset: number, segLength: number): ReadableField[] {
  const payloadStart = segOffset + 4
  const payloadLength = Math.max(0, segLength - 4)
  return parseJfifPayload(data, payloadStart, payloadLength)
}
