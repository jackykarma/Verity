import { formatByteOffset } from '../shared/formatUtils.ts'
import type { ReadableField, ReadablePayload } from '../shared/types/present.ts'
import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import { hexPreview } from './ExifExtractor.ts'
import {
  buildExifToolRefFields,
  matchAppPayload,
  refForCatalogId,
  sofEncodingLabel,
} from './jpegExifToolRef.ts'
import { parseSofSummary } from './SegmentTreeBuilder.ts'

const ICC_DEVICE_CLASS: Record<string, string> = {
  scnr: '输入设备（扫描仪）',
  mntr: '显示器',
  prtr: '输出设备（打印机）',
  link: '设备链接',
  abstr: '抽象',
  spac: '色彩空间',
}

const ICC_COLOR_SPACE: Record<string, string> = {
  RGB: 'RGB',
  GRAY: '灰度',
  CMYK: 'CMYK',
  Lab: 'Lab',
  XYZ: 'XYZ',
  YCbCr: 'YCbCr',
}

function baseFields(node: SegmentNodeDto): ReadableField[] {
  return [
    { key: '目录 ID', value: node.parCatalogId },
    { key: '偏移', value: formatByteOffset(node.offset) },
    { key: '长度', value: String(node.length) },
  ]
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

function fourCc(data: Uint8Array, offset: number): string {
  if (offset + 4 > data.length) {
    return '????'
  }
  return String.fromCharCode(data[offset]!, data[offset + 1]!, data[offset + 2]!, data[offset + 3]!)
}

function readBe32(data: Uint8Array, offset: number): number {
  return (
    ((data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!) >>>
    0
  )
}

function appPayloadStart(segOffset: number): number {
  return segOffset + 4
}

function extractJfif(data: Uint8Array, segOffset: number): ReadableField[] {
  const start = appPayloadStart(segOffset)
  const fields: ReadableField[] = []
  const id = readAscii(data, start, 5)
  fields.push({ key: '标识', value: id || '（未知）' })
  if (id.startsWith('JFIF') && start + 11 <= data.length) {
    fields.push({ key: '版本', value: `${data[start + 5]}.${data[start + 6]}` })
    const units = data[start + 7]
    fields.push({
      key: '密度单位',
      value: units === 0 ? '无单位（比例）' : units === 1 ? 'dpi' : units === 2 ? 'dpcm' : String(units),
    })
    const xDensity = (data[start + 8]! << 8) | data[start + 9]!
    const yDensity = (data[start + 10]! << 8) | data[start + 11]!
    fields.push({ key: 'X 密度', value: String(xDensity) })
    fields.push({ key: 'Y 密度', value: String(yDensity) })
  }
  return fields
}

function extractIcc(data: Uint8Array, segOffset: number): ReadableField[] {
  const payloadStart = appPayloadStart(segOffset)
  const fields: ReadableField[] = []
  let profileStart = payloadStart

  const headerId = readAscii(data, payloadStart, 12)
  if (headerId.startsWith('ICC_PROFILE')) {
    fields.push({ key: 'APP2 类型', value: 'ICC 色彩配置文件（分块封装）' })
    if (payloadStart + 14 <= data.length) {
      fields.push({ key: '当前分块', value: String(data[payloadStart + 12] ?? 0) })
      fields.push({ key: '总分块数', value: String(data[payloadStart + 13] ?? 0) })
    }
    profileStart = payloadStart + 14
  } else {
    fields.push({ key: 'APP2 类型', value: 'ICC 色彩配置文件' })
  }

  if (profileStart + 128 > data.length) {
    fields.push({ key: '提示', value: 'ICC 配置文件头不完整' })
    return fields
  }

  const profileSize = readBe32(data, profileStart)
  const cmm = fourCc(data, profileStart + 4)
  const versionMajor = data[profileStart + 8] ?? 0
  const versionMinor = data[profileStart + 9] ?? 0
  const deviceClass = fourCc(data, profileStart + 12)
  const colorSpace = fourCc(data, profileStart + 16)
  const pcs = fourCc(data, profileStart + 20)
  const signature = fourCc(data, profileStart + 36)

  fields.push({ key: '配置文件大小', value: `${profileSize} 字节` })
  fields.push({ key: 'CMM 类型', value: cmm.trim() || '（未指定）' })
  fields.push({ key: '版本', value: `${versionMajor}.${versionMinor >> 4}.${versionMinor & 0x0f}` })
  fields.push({ key: '设备类别', value: ICC_DEVICE_CLASS[deviceClass] ?? deviceClass })
  fields.push({ key: '色彩空间', value: ICC_COLOR_SPACE[colorSpace] ?? colorSpace })
  fields.push({ key: '连接色彩空间 (PCS)', value: ICC_COLOR_SPACE[pcs] ?? pcs })
  fields.push({ key: '签名', value: signature === 'acsp' ? 'acsp（有效 ICC）' : signature })

  const descOffset = readBe32(data, profileStart + 84)
  if (signature === 'acsp' && descOffset > 0 && profileStart + descOffset + 12 < data.length) {
    const tagSig = fourCc(data, profileStart + descOffset + 4)
    if (tagSig === 'desc' || tagSig === 'mluc') {
      const textLen = readBe32(data, profileStart + descOffset + 8)
      const textStart = profileStart + descOffset + 12
      const name = readAscii(data, textStart, Math.min(textLen, 128))
      if (name) {
        fields.push({ key: '配置文件描述', value: name })
      }
    }
  }

  return fields
}

function extractAdobeApp14(data: Uint8Array, segOffset: number): ReadableField[] {
  const start = appPayloadStart(segOffset)
  const fields: ReadableField[] = []
  fields.push({ key: '标识', value: readAscii(data, start, 6) })
  if (start + 9 <= data.length) {
    const dctVersion = data[start + 5] ?? 0
    const flags0 = data[start + 6] ?? 0
    const flags1 = data[start + 7] ?? 0
    const colorTransform = data[start + 8] ?? 0
    fields.push({ key: 'DCTEncodeVersion', value: String(dctVersion) })
    fields.push({
      key: 'APP14Flags0',
      value:
        flags0 === 0
          ? '(none)'
          : `${flags0 & 0x80 ? 'Bit15 Blend=1 downsampling ' : ''}0x${flags0.toString(16)}`,
    })
    fields.push({ key: 'APP14Flags1', value: flags1 === 0 ? '(none)' : `0x${flags1.toString(16)}` })
    fields.push({
      key: 'ColorTransform',
      value:
        colorTransform === 0
          ? 'Unknown (RGB or CMYK)'
          : colorTransform === 1
            ? 'YCbCr'
            : colorTransform === 2
              ? 'YCCK'
              : `代码 ${colorTransform}`,
    })
  }
  return fields
}

function extractGenericApp(data: Uint8Array, segOffset: number, segLength: number): ReadableField[] {
  const start = appPayloadStart(segOffset)
  const payloadLen = Math.max(0, segLength - 4)
  const fields: ReadableField[] = []
  const id = readAscii(data, start, Math.min(64, payloadLen))
  fields.push({ key: '段标识', value: id || '（无 ASCII 标识）' })

  const printable = readAscii(data, start, Math.min(256, payloadLen))
  if (printable.length > id.length + 4) {
    fields.push({ key: '文本摘要', value: printable.slice(0, 200) })
  }
  return fields
}

function extractDqt(data: Uint8Array, segOffset: number, segLength: number): ReadableField[] {
  const start = segOffset + 4
  const end = segOffset + segLength
  const fields: ReadableField[] = []
  let pos = start
  let tableIndex = 0

  while (pos < end && pos < data.length) {
    const pq = data[pos]
    if (pq === undefined) {
      break
    }
    const precision = pq >> 4
    const id = pq & 0x0f
    const tableBytes = precision === 0 ? 64 : 128
    fields.push({
      key: `量化表 ${tableIndex + 1}`,
      value: `编号 ${id} · ${precision === 0 ? '8 位' : '16 位'} · ${tableBytes} 字节系数`,
    })
    pos += 1 + tableBytes
    tableIndex++
  }

  fields.push({ key: '量化表数量', value: String(tableIndex) })
  return fields
}

function extractDht(data: Uint8Array, segOffset: number, segLength: number): ReadableField[] {
  const start = segOffset + 4
  const end = segOffset + segLength
  const fields: ReadableField[] = []
  let pos = start
  let tableIndex = 0

  while (pos < end && pos + 17 <= data.length) {
    const tc = data[pos]!
    const tableClass = tc >> 4 === 0 ? 'DC' : 'AC'
    const tableId = tc & 0x0f
    let codeCount = 0
    for (let i = 1; i <= 16; i++) {
      codeCount += data[pos + i] ?? 0
    }
    fields.push({
      key: `霍夫曼表 ${tableIndex + 1}`,
      value: `${tableClass} 表 · 编号 ${tableId} · ${codeCount} 个码字`,
    })
    pos += 17 + codeCount
    tableIndex++
  }

  fields.push({ key: '霍夫曼表数量', value: String(tableIndex) })
  return fields
}

function markerAt(data: Uint8Array, segOffset: number): number | undefined {
  if (data[segOffset] === 0xff && segOffset + 1 < data.length) {
    return data[segOffset + 1]
  }
  return undefined
}

function exifToolFields(node: SegmentNodeDto, data: Uint8Array): ReadableField[] {
  const marker = markerAt(data, node.offset)
  if (marker !== undefined && marker >= 0xe0 && marker <= 0xef) {
    const appNum = marker - 0xe0
    const match = matchAppPayload(appNum, data, node.offset + 4)
    return buildExifToolRefFields(match)
  }
  const ref = refForCatalogId(node.parCatalogId, marker)
  return ref ? buildExifToolRefFields(ref) : []
}

function extractSof(data: Uint8Array, segOffset: number, segLength: number): ReadableField[] {
  const base = segOffset + 4
  const fields: ReadableField[] = []
  if (segLength < 8) {
    return fields
  }

  const marker = markerAt(data, segOffset)
  if (marker !== undefined) {
    const enc = sofEncodingLabel(marker)
    if (enc) {
      fields.push({ key: 'EncodingProcess', value: enc })
    }
  }

  const precision = data[base] ?? 0
  const sof = parseSofSummary(data, segOffset, segLength)
  fields.push({ key: 'BitsPerSample', value: `${precision} 位/样本` })
  if (sof) {
    fields.push({ key: 'ImageWidth', value: `${sof.width} px` })
    fields.push({ key: 'ImageHeight', value: `${sof.height} px` })
    fields.push({ key: 'ColorComponents', value: String(sof.components) })
  }

  let pos = base + 6
  for (let i = 0; i < (sof?.components ?? 0) && pos + 2 < segOffset + segLength; i++) {
    const cid = data[pos]!
    const sampling = data[pos + 1] ?? 0
    const qt = data[pos + 2] ?? 0
    const h = sampling >> 4
    const v = sampling & 0x0f
    fields.push({
      key: `分量 ${i + 1}`,
      value: `ID=${cid} · 采样 ${h}×${v} · 量化表 ${qt}`,
    })
    pos += 3
  }
  return fields
}

function extractSos(data: Uint8Array, segOffset: number, segLength: number): ReadableField[] {
  const base = segOffset + 4
  const fields: ReadableField[] = []
  if (segLength < 6) {
    return fields
  }

  const ns = data[base + 1] ?? 0
  fields.push({ key: '扫描分量数', value: String(ns) })

  let pos = base + 2
  for (let i = 0; i < ns && pos + 1 < segOffset + segLength; i++) {
    const cs = data[pos]!
    const tdTa = data[pos + 1] ?? 0
    fields.push({
      key: `扫描分量 ${i + 1}`,
      value: `分量 ID=${cs} · DC 表 ${tdTa >> 4} · AC 表 ${tdTa & 0x0f}`,
    })
    pos += 2
  }

  if (pos + 2 < segOffset + segLength) {
    fields.push({ key: '谱选择起始', value: String(data[pos]) })
    fields.push({ key: '谱选择结束', value: String(data[pos + 1]) })
    const ahAl = data[pos + 2] ?? 0
    fields.push({ key: '逐次逼近', value: `Ah=${ahAl >> 4} · Al=${ahAl & 0x0f}` })
  }

  fields.push({
    key: '说明',
    value: 'SOS 之后为熵编码压缩数据（见「压缩图像数据」节点）',
  })
  return fields
}

function extractDri(data: Uint8Array, segOffset: number): ReadableField[] {
  const base = segOffset + 4
  if (base + 2 > data.length) {
    return []
  }
  const interval = (data[base]! << 8) | data[base + 1]!
  return [
    { key: '重启间隔', value: `${interval} MCU` },
    {
      key: '说明',
      value: interval > 0 ? '扫描数据中每隔 N 个 MCU 插入 RST 标记' : '未启用重启间隔',
    },
  ]
}

export function buildSegmentDetailReadable(
  node: SegmentNodeDto,
  buffer: ArrayBuffer,
): ReadablePayload {
  const data = new Uint8Array(buffer)
  const slice = buffer.slice(node.offset, node.offset + node.length)
  let extra: ReadableField[] = []

  switch (node.parCatalogId) {
    case 'PAR-JPEG-001':
      extra = [{ key: '含义', value: 'Start Of Image — JPEG 码流起始标记 (FF D8)' }]
      break
    case 'PAR-JPEG-002':
      extra = [{ key: '含义', value: 'End Of Image — JPEG 码流结束标记 (FF D9)' }]
      break
    case 'PAR-JPEG-003':
      extra = extractJfif(data, node.offset)
      break
    case 'PAR-JPEG-006':
      extra = extractIcc(data, node.offset)
      break
    case 'PAR-JPEG-008':
      extra = extractAdobeApp14(data, node.offset)
      break
    case 'PAR-JPEG-009':
      extra = extractGenericApp(data, node.offset, node.length)
      break
    case 'PAR-JPEG-011':
      extra = extractDqt(data, node.offset, node.length)
      break
    case 'PAR-JPEG-012':
      extra = extractDht(data, node.offset, node.length)
      break
    case 'PAR-JPEG-013':
    case 'PAR-JPEG-020':
      extra = extractSof(data, node.offset, node.length)
      break
    case 'PAR-JPEG-014':
      extra = extractSos(data, node.offset, node.length)
      break
    case 'PAR-JPEG-016':
      extra = extractDri(data, node.offset)
      break
    case 'PAR-JPEG-017':
      extra = [{ key: '含义', value: 'Restart Marker — 熵数据中的同步重启点' }]
      break
    case 'PAR-JPEG-015':
      extra = [{ key: '说明', value: 'JPEG 熵编码压缩比特流；选中此节点可预览解码后的图像' }]
      break
    default:
      if (node.label.startsWith('APP')) {
        extra = extractGenericApp(data, node.offset, node.length)
      }
      break
  }

  const payload: ReadablePayload = {
    title: node.label,
    fields: [...baseFields(node), ...exifToolFields(node, data), ...extra],
    hexPreview: hexPreview(slice, Math.min(node.length, 512)),
  }

  return payload
}
