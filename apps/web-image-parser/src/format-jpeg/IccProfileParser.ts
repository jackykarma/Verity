import type { ReadableField } from '../shared/types/present.ts'

/** ExifTool ICC_Profile Header + 常用 Tag 解析（对齐 https://exiftool.org/TagNames/ICC_Profile.html） */

const PROFILE_CLASS: Record<string, string> = {
  abst: 'Abstract Profile',
  cenc: 'ColorEncodingSpace Profile',
  link: 'DeviceLink Profile',
  'mid ': 'MultiplexIdentification Profile',
  mlnk: 'MultiplexLink Profile',
  mntr: 'Display Device Profile',
  mvis: 'MultiplexVisualization Profile',
  nkpf: 'Nikon Input Device Profile (NON-STANDARD!)',
  nmcl: 'NamedColor Profile',
  prtr: 'Output Device Profile',
  scnr: 'Input Device Profile',
  spac: 'ColorSpace Conversion Profile',
}

const RENDERING_INTENT: Record<number, string> = {
  0: 'Perceptual',
  1: 'Media-Relative Colorimetric',
  2: 'Saturation',
  3: 'ICC-Absolute Colorimetric',
}

const MANU_SIG: Record<string, string> = {
  ADBE: 'Adobe Systems Inc.',
  APPL: 'Apple Computer Inc.',
  appl: 'Apple Computer Inc.',
  MSFT: 'Microsoft Corporation',
  SICC: 'International Color Consortium',
  SONY: 'SONY Corporation',
  CANO: 'Canon, Inc. (Canon Development Americas, Inc.)',
  NKON: 'Nikon Corporation',
  EPSO: 'Epson',
  'HP ': 'Hewlett-Packard',
  KODA: 'Kodak',
  XRIT: 'X-Rite',
  lcms: 'Little CMS',
  none: 'none',
  NONE: 'none',
}

const ICC_TAG_LABEL: Record<string, string> = {
  desc: 'Profile Description',
  cprt: 'Profile Copyright',
  wtpt: 'Media White Point',
  rXYZ: 'Red Matrix Column',
  gXYZ: 'Green Matrix Column',
  bXYZ: 'Blue Matrix Column',
  rTRC: 'Red Tone Reproduction Curve',
  gTRC: 'Green Tone Reproduction Curve',
  bTRC: 'Blue Tone Reproduction Curve',
  kTRC: 'Gray Tone Reproduction Curve',
  chad: 'Chromatic Adaptation',
  dmnd: 'Device Mfg Desc',
  dmdd: 'Device Model Desc',
  tech: 'Technology',
}

const HEADER_TAG_ORDER = [
  'ProfileCMMType',
  'ProfileVersion',
  'ProfileClass',
  'ColorSpaceData',
  'ProfileConnectionSpace',
  'ProfileDateTime',
  'ProfileFileSignature',
  'PrimaryPlatform',
  'CMMFlags',
  'DeviceManufacturer',
  'DeviceModel',
  'DeviceAttributes',
  'RenderingIntent',
  'ConnectionSpaceIlluminant',
  'ProfileCreator',
  'ProfileID',
] as const

const TAG_DISPLAY_ORDER = [
  'desc',
  'cprt',
  'wtpt',
  'rXYZ',
  'gXYZ',
  'bXYZ',
  'rTRC',
  'chad',
  'gTRC',
  'bTRC',
  'kTRC',
  'dmnd',
  'dmdd',
  'tech',
]

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

function trimFourCc(value: string): string {
  return value.replace(/\0/g, '').trimEnd()
}

function formatManuSig(sig: string): string {
  const trimmed = trimFourCc(sig)
  if (!trimmed) {
    return 'none'
  }
  const known = MANU_SIG[sig] ?? MANU_SIG[trimmed]
  if (known) {
    return known
  }
  return `Unknown (${trimmed})`
}

function readS15Fixed16(data: Uint8Array, offset: number): number {
  const raw = readBe32(data, offset)
  const signed = raw > 0x7fffffff ? raw - 0x1_0000_0000 : raw
  return Math.round((signed / 65536) * 100000) / 100000
}

function formatXyzTriplet(data: Uint8Array, offset: number): string {
  if (offset + 12 > data.length) {
    return '（不完整）'
  }
  return `${readS15Fixed16(data, offset)} ${readS15Fixed16(data, offset + 4)} ${readS15Fixed16(data, offset + 8)}`
}

function formatProfileVersion(data: Uint8Array, offset: number): string {
  const major = data[offset] ?? 0
  const minorRev = data[offset + 1] ?? 0
  return `${major}.${minorRev >> 4}.${minorRev & 0x0f}`
}

function formatProfileDateTime(data: Uint8Array, offset: number): string {
  if (offset + 12 > data.length) {
    return '（无）'
  }
  const year = readBe16(data, offset)
  const month = readBe16(data, offset + 2)
  const day = readBe16(data, offset + 4)
  const hour = readBe16(data, offset + 6)
  const minute = readBe16(data, offset + 8)
  const second = readBe16(data, offset + 10)
  if (year === 0) {
    return '（无）'
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${year}:${pad(month)}:${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`
}

function readBe16(data: Uint8Array, offset: number): number {
  return (data[offset]! << 8) | data[offset + 1]!
}

function formatCmmFlags(flags: number): string {
  const parts: string[] = []
  parts.push(flags & 1 ? 'Embedded' : 'Not Embedded')
  parts.push(flags & 2 ? 'Linked' : 'Independent')
  return parts.join(', ')
}

function formatDeviceAttributes(attrLo: number, attrHi: number): string {
  const attr = attrHi * 0x1_0000_0000 + attrLo
  const parts: string[] = []
  parts.push(attr & 1 ? 'Transparent' : 'Reflective')
  parts.push(attr & 2 ? 'Matte' : 'Glossy')
  parts.push(attr & 4 ? 'Negative' : 'Positive')
  parts.push(attr & 8 ? 'B&W' : 'Color')
  return parts.join(', ')
}

function formatProfileId(data: Uint8Array, offset: number): string {
  const slice = data.slice(offset, offset + 16)
  if (slice.every((b) => b === 0)) {
    return '0'
  }
  return Array.from(slice)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function parseTextTag(data: Uint8Array, tagOffset: number, tagSize: number): string | null {
  if (tagSize < 8 || tagOffset + tagSize > data.length) {
    return null
  }
  const sig = fourCc(data, tagOffset)
  if (sig === 'text') {
    return readAscii(data, tagOffset + 8, tagSize - 8) || null
  }
  if (sig === 'desc') {
    if (tagSize < 12) {
      return null
    }
    const count = readBe32(data, tagOffset + 8)
    const text = readAscii(data, tagOffset + 12, Math.max(0, count - 1))
    return text || null
  }
  if (sig === 'mluc') {
    const count = readBe32(data, tagOffset + 8)
    const recordSize = readBe32(data, tagOffset + 12)
    if (count === 0 || recordSize < 12) {
      return null
    }
    let fallback: string | null = null
    const recordsStart = tagOffset + 16
    for (let i = 0; i < count; i++) {
      const rec = recordsStart + i * recordSize
      if (rec + 12 > tagOffset + tagSize) {
        break
      }
      const lang = String.fromCharCode(data[rec]!, data[rec + 1]!)
      const country = String.fromCharCode(data[rec + 2]!, data[rec + 3]!)
      const len = readBe32(data, rec + 4)
      const strRel = readBe32(data, rec + 8)
      const strStart = tagOffset + strRel
      const text = readAscii(data, strStart, Math.max(0, len))
      if (lang === 'en' && country === 'US') {
        return text || null
      }
      if (!fallback && text) {
        fallback = text
      }
    }
    return fallback
  }
  return null
}

function parseTagValue(data: Uint8Array, sig: string, tagOffset: number, tagSize: number): string | null {
  if (tagSize < 8 || tagOffset + tagSize > data.length) {
    return null
  }

  const text = parseTextTag(data, tagOffset, tagSize)
  if (text) {
    return text
  }

  const typeSig = fourCc(data, tagOffset)
  if (typeSig === 'XYZ ' && tagSize >= 20) {
    return formatXyzTriplet(data, tagOffset + 8)
  }
  if (typeSig === 'curv' || typeSig === 'para') {
    return `(Binary data ${tagSize} bytes, use -b option to extract)`
  }
  if (typeSig === 'sf32' && sig === 'chad' && tagSize >= 44) {
    const values: string[] = []
    for (let i = 0; i < 9; i++) {
      values.push(String(readS15Fixed16(data, tagOffset + 8 + i * 4)))
    }
    return values.join(' ')
  }

  return null
}

export interface IccJpegChunkInfo {
  chunkIndex: number
  chunkCount: number
  segOffset: number
  segLength: number
}

export function findIccJpegChunks(data: Uint8Array): IccJpegChunkInfo[] {
  const chunks: IccJpegChunkInfo[] = []

  for (let i = 0; i + 4 < data.length; i++) {
    if (data[i] !== 0xff || data[i + 1] !== 0xe2) {
      continue
    }
    const segLen = (data[i + 2]! << 8) | data[i + 3]!
    const payloadStart = i + 4
    if (payloadStart + 14 > data.length) {
      continue
    }
    const headerId = readAscii(data, payloadStart, 12)
    if (!headerId.startsWith('ICC_PROFILE')) {
      continue
    }
    chunks.push({
      chunkIndex: data[payloadStart + 12] ?? 0,
      chunkCount: data[payloadStart + 13] ?? 0,
      segOffset: i,
      segLength: 2 + segLen,
    })
  }

  return chunks.sort((a, b) => a.chunkIndex - b.chunkIndex)
}

/** 从 JPEG 缓冲区拼接 APP2 ICC_PROFILE 分块，返回完整 profile 字节。 */
export function assembleIccProfileFromJpeg(buffer: ArrayBuffer): {
  profile: Uint8Array | null
  chunks: IccJpegChunkInfo[]
} {
  const data = new Uint8Array(buffer)
  const chunks = findIccJpegChunks(data)
  if (chunks.length === 0) {
    return { profile: null, chunks }
  }

  const parts: Uint8Array[] = []
  for (const chunk of chunks) {
    const payloadStart = chunk.segOffset + 4
    const payloadLen = chunk.segLength - 4
    if (payloadLen <= 14) {
      continue
    }
    parts.push(data.slice(payloadStart + 14, payloadStart + payloadLen))
  }

  if (parts.length === 0) {
    return { profile: null, chunks }
  }

  const total = parts.reduce((sum, p) => sum + p.length, 0)
  const profile = new Uint8Array(total)
  let pos = 0
  for (const part of parts) {
    profile.set(part, pos)
    pos += part.length
  }

  return { profile, chunks }
}

function parseHeaderFields(profile: Uint8Array): Map<string, string> {
  const fields = new Map<string, string>()
  if (profile.length < 128) {
    return fields
  }

  fields.set('ProfileCMMType', formatManuSig(fourCc(profile, 4)))
  fields.set('ProfileVersion', formatProfileVersion(profile, 8))
  fields.set('ProfileClass', PROFILE_CLASS[fourCc(profile, 12)] ?? trimFourCc(fourCc(profile, 12)))
  fields.set('ColorSpaceData', trimFourCc(fourCc(profile, 16)))
  fields.set('ProfileConnectionSpace', trimFourCc(fourCc(profile, 20)))
  fields.set('ProfileDateTime', formatProfileDateTime(profile, 24))
  fields.set('ProfileFileSignature', fourCc(profile, 36))
  fields.set('PrimaryPlatform', formatManuSig(fourCc(profile, 40)))
  fields.set('CMMFlags', formatCmmFlags(readBe32(profile, 44)))
  fields.set('DeviceManufacturer', formatManuSig(fourCc(profile, 48)))
  fields.set('DeviceModel', trimFourCc(fourCc(profile, 52)) || ' ')
  fields.set(
    'DeviceAttributes',
    formatDeviceAttributes(readBe32(profile, 56), readBe32(profile, 60)),
  )
  fields.set('RenderingIntent', RENDERING_INTENT[readBe32(profile, 64)] ?? String(readBe32(profile, 64)))
  fields.set('ConnectionSpaceIlluminant', formatXyzTriplet(profile, 68))
  fields.set('ProfileCreator', formatManuSig(fourCc(profile, 80)))
  fields.set('ProfileID', formatProfileId(profile, 84))

  return fields
}

function parseTagTable(profile: Uint8Array): Map<string, { offset: number; size: number }> {
  const tags = new Map<string, { offset: number; size: number }>()
  if (profile.length < 132) {
    return tags
  }

  const count = readBe32(profile, 128)
  const tableEnd = 132 + count * 12
  if (tableEnd > profile.length) {
    return tags
  }

  for (let i = 0; i < count; i++) {
    const base = 132 + i * 12
    const sig = fourCc(profile, base)
    const offset = readBe32(profile, base + 4)
    const size = readBe32(profile, base + 8)
    if (offset + size <= profile.length) {
      tags.set(sig, { offset, size })
    }
  }

  return tags
}

export function buildIccProfileReadableFields(profile: Uint8Array): ReadableField[] {
  const fields: ReadableField[] = []
  const header = parseHeaderFields(profile)

  for (const key of HEADER_TAG_ORDER) {
    const value = header.get(key)
    if (value !== undefined) {
      fields.push({ key, value })
    }
  }

  const tags = parseTagTable(profile)
  const emitted = new Set<string>()

  for (const sig of TAG_DISPLAY_ORDER) {
    const tag = tags.get(sig)
    if (!tag) {
      continue
    }
    const value = parseTagValue(profile, sig, tag.offset, tag.size)
    if (value == null) {
      continue
    }
    fields.push({ key: ICC_TAG_LABEL[sig] ?? sig, value })
    emitted.add(sig)
  }

  for (const [sig, tag] of tags) {
    if (emitted.has(sig) || sig === 'Header') {
      continue
    }
    const value = parseTagValue(profile, sig, tag.offset, tag.size)
    if (value == null) {
      continue
    }
    fields.push({ key: ICC_TAG_LABEL[sig] ?? sig, value })
  }

  return fields
}

export function buildIccReadableFromSegment(
  data: Uint8Array,
  segOffset: number,
  buffer?: ArrayBuffer,
): ReadableField[] {
  const fields: ReadableField[] = []
  const payloadStart = segOffset + 4
  const headerId = readAscii(data, payloadStart, 12)

  if (headerId.startsWith('ICC_PROFILE')) {
    fields.push({ key: 'APP2 封装', value: 'ICC_PROFILE 分块' })
    if (payloadStart + 14 <= data.length) {
      fields.push({ key: 'CurrentChunk', value: String(data[payloadStart + 12] ?? 0) })
      fields.push({ key: 'TotalChunks', value: String(data[payloadStart + 13] ?? 0) })
    }
  } else {
    fields.push({ key: 'APP2 封装', value: '裸 ICC Profile' })
  }

  const assembled = buffer ? assembleIccProfileFromJpeg(buffer) : { profile: null, chunks: [] }
  let profile = assembled.profile

  if (!profile && payloadStart + 128 <= data.length && fourCc(data, payloadStart) !== 'ICC') {
    profile = data.slice(payloadStart)
  } else if (!profile && payloadStart + 14 + 128 <= data.length) {
    profile = data.slice(payloadStart + 14)
  }

  if (!profile || profile.length < 128) {
    fields.push({ key: '提示', value: 'ICC 配置文件不完整或无法拼接' })
    return fields
  }

  if (assembled.chunks.length > 1) {
    fields.push({
      key: 'ProfileAssembly',
      value: `已拼接 ${assembled.chunks.length} 个 APP2 ICC_PROFILE 分块`,
    })
  }

  fields.push(...buildIccProfileReadableFields(profile))
  return fields
}
