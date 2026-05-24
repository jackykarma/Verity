import type { GalleryImage, ReadableField, ReadablePayload } from '../shared/types/present.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'
import { resolveContainerItemOffsets, patchMotionPhotoLengthFromXml, semanticDisplayLabel, type XmpContainerItem } from './XmpContainer.ts'

const MPF_TAG_VERSION = 0xb000
const MPF_TAG_NUM_IMAGES = 0xb001
const MPF_TAG_MP_ENTRY = 0xb002
const MPF_TAG_IMAGE_UID_LIST = 0xb003
const MPF_TAG_TOTAL_FRAMES = 0xb004
const MPF_TAG_INDIVIDUAL_NUM = 0xb101
const MPF_TAG_PAN_ORIENTATION = 0xb201
const MPF_TAG_PAN_OVERLAP_H = 0xb202
const MPF_TAG_PAN_OVERLAP_V = 0xb203
const MPF_TAG_BASE_VIEWPOINT_NUM = 0xb204
const MPF_TAG_CONVERGENCE_ANGLE = 0xb205
const MPF_TAG_BASELINE_LENGTH = 0xb206

/** MPF IFD 标签名，参考 ExifTool MPF Tags */
const MPF_TAG_NAMES: Record<number, string> = {
  [MPF_TAG_VERSION]: 'MPFVersion',
  [MPF_TAG_NUM_IMAGES]: 'NumberOfImages',
  [MPF_TAG_MP_ENTRY]: 'MPImageList',
  [MPF_TAG_IMAGE_UID_LIST]: 'ImageUIDList',
  [MPF_TAG_TOTAL_FRAMES]: 'TotalFrames',
  [MPF_TAG_INDIVIDUAL_NUM]: 'MPIndividualNum',
  [MPF_TAG_PAN_ORIENTATION]: 'PanOrientation',
  [MPF_TAG_PAN_OVERLAP_H]: 'PanOverlapH',
  [MPF_TAG_PAN_OVERLAP_V]: 'PanOverlapV',
  [MPF_TAG_BASE_VIEWPOINT_NUM]: 'BaseViewpointNum',
  [MPF_TAG_CONVERGENCE_ANGLE]: 'ConvergenceAngle',
  [MPF_TAG_BASELINE_LENGTH]: 'BaselineLength',
}

/** MPImageType，参考 ExifTool MPImage Tags */
const MP_IMAGE_TYPES: Record<number, string> = {
  0x0: 'Undefined',
  0x10001: 'Large Thumbnail (VGA)',
  0x10002: 'Large Thumbnail (Full HD)',
  0x10003: 'Large Thumbnail (4K)',
  0x10004: 'Large Thumbnail (8K)',
  0x10005: 'Large Thumbnail (16K)',
  0x20001: 'Multi-frame Panorama',
  0x20002: 'Multi-frame Disparity',
  0x20003: 'Multi-angle',
  0x30000: 'Baseline MP Primary Image',
  0x40000: 'Original Preservation Image',
  0x50000: 'Gain Map Image',
}

export interface MpfIfdField {
  tag: number
  name: string
  value: string
}

export interface MpfImageEntry {
  index: number
  rawAttr: number
  flags: number
  flagsLabel: string
  formatCode: number
  format: string
  imageType: number
  imageTypeLabel: string
  size: number
  offset: number
  role: string
  dependent1: number
  dependent2: number
  /** XMP Container Item:Semantic，如 Primary / GainMap */
  semantic?: string
  /** XMP Container 解析出的文件内偏移（Motion Photo 尾部堆叠） */
  xmpOffset?: number
  xmpLength?: number
}

export interface MpfParseResult {
  version: string | null
  numberOfImages: number | null
  totalFrames: number | null
  ifdFields: MpfIfdField[]
  entries: MpfImageEntry[]
}

function readAscii(data: Uint8Array, offset: number, length: number): string {
  let out = ''
  for (let i = 0; i < length && offset + i < data.length; i++) {
    const c = data[offset + i]
    if (c === undefined || c === 0) {
      break
    }
    out += String.fromCharCode(c)
  }
  return out
}

function findMpfOffset(data: Uint8Array, segOffset: number, segLength: number): number {
  const payloadStart = segOffset + 4
  const payloadEnd = Math.min(segOffset + segLength, data.length)
  for (let i = payloadStart; i <= payloadEnd - 4; i++) {
    if (data[i] === 0x4d && data[i + 1] === 0x50 && data[i + 2] === 0x46 && data[i + 3] === 0) {
      return i
    }
  }
  return -1
}

function decodeMpfFlags(flags: number): string {
  const parts: string[] = []
  if (flags & (1 << 2)) {
    parts.push('Representative image (代表图)')
  }
  if (flags & (1 << 3)) {
    parts.push('Dependent child image (依赖子图)')
  }
  if (flags & (1 << 4)) {
    parts.push('Dependent parent image (依赖父图)')
  }
  return parts.length > 0 ? parts.join(' · ') : `Flags 0x${flags.toString(16)}`
}

function mpfFormatLabel(code: number): string {
  if (code === 0) {
    return 'JPEG'
  }
  return `Format ${code}`
}

function mpfImageTypeLabel(type: number): string {
  return MP_IMAGE_TYPES[type] ?? `0x${type.toString(16)}`
}

function formatMpImageFlags(flags: number, flagsLabel: string): string {
  if (flags === 0) {
    return '0'
  }
  return `${flagsLabel} (0x${flags.toString(16)})`
}

function formatMpImageFormat(formatCode: number): string {
  return formatCode === 0 ? 'JPEG' : String(formatCode)
}

function formatMpImageType(imageType: number, imageTypeLabel: string): string {
  return `${imageTypeLabel} (0x${imageType.toString(16)})`
}

/** MP Entry 16 字节结构字段，顺序对齐 ExifTool MPImage Tags 表 */
export function buildMpImageEntryFields(entry: MpfImageEntry): ReadableField[] {
  const n = entry.index + 1
  const prefix = `MPImage ${n} · `
  const fields: ReadableField[] = [
    { key: `${prefix}MPImageFlags`, value: formatMpImageFlags(entry.flags, entry.flagsLabel) },
    { key: `${prefix}MPImageFormat`, value: formatMpImageFormat(entry.formatCode) },
    { key: `${prefix}MPImageType`, value: formatMpImageType(entry.imageType, entry.imageTypeLabel) },
    { key: `${prefix}MPImageLength`, value: String(entry.size) },
    { key: `${prefix}MPImageStart`, value: formatByteOffset(entry.offset) },
    { key: `${prefix}DependentImage1EntryNumber`, value: String(entry.dependent1) },
    { key: `${prefix}DependentImage2EntryNumber`, value: String(entry.dependent2) },
  ]

  return fields
}

function buildEntryRole(flagsLabel: string, imageTypeLabel: string): string {
  if (imageTypeLabel !== 'Undefined') {
    return imageTypeLabel
  }
  if (flagsLabel && !flagsLabel.startsWith('Flags ')) {
    return flagsLabel
  }
  return '默认视图'
}

function decodeMpEntryAttr(attr: number): Pick<
  MpfImageEntry,
  'rawAttr' | 'flags' | 'flagsLabel' | 'formatCode' | 'format' | 'imageType' | 'imageTypeLabel' | 'role'
> {
  const flags = (attr >>> 27) & 0x1f
  const formatCode = (attr >>> 24) & 0x7
  const imageType = attr & 0xffffff
  const flagsLabel = decodeMpfFlags(flags)
  const format = mpfFormatLabel(formatCode)
  const imageTypeLabel = mpfImageTypeLabel(imageType)

  return {
    rawAttr: attr,
    flags,
    flagsLabel,
    formatCode,
    format,
    imageType,
    imageTypeLabel,
    role: buildEntryRole(flagsLabel, imageTypeLabel),
  }
}

function mpfTagName(tag: number): string {
  return MPF_TAG_NAMES[tag] ?? `0x${tag.toString(16)}`
}

function formatIfdScalar(read32: (o: number) => number, type: number, count: number, vo: number, data: Uint8Array): string {
  if (type === 4 && count === 1) {
    return String(read32(vo))
  }
  if (type === 3 && count === 1) {
    return String(data[vo]! | (data[vo + 1]! << 8))
  }
  if (type === 7) {
    return `${count} 字节`
  }
  return `type=${type}, count=${count}`
}

function parseIfd(
  data: Uint8Array,
  ifdOffset: number,
  tiffStart: number,
  read16: (o: number) => number,
  read32: (o: number) => number,
): Partial<MpfParseResult> {
  if (ifdOffset + 2 > data.length) {
    return { entries: [], ifdFields: [] }
  }

  const count = read16(ifdOffset)
  let version: string | null = null
  let numberOfImages: number | null = null
  let totalFrames: number | null = null
  const entries: MpfImageEntry[] = []
  const ifdFields: MpfIfdField[] = []

  for (let i = 0; i < count; i++) {
    const entryOffset = ifdOffset + 2 + i * 12
    if (entryOffset + 12 > data.length) {
      break
    }

    const tag = read16(entryOffset)
    const type = read16(entryOffset + 2)
    const valueCount = read32(entryOffset + 4)
    const valueOrOffset = read32(entryOffset + 8)
    const tagName = mpfTagName(tag)

    if (tag === MPF_TAG_VERSION && type === 7 && valueCount >= 4) {
      const vo = valueCount <= 4 ? entryOffset + 8 : tiffStart + valueOrOffset
      version = readAscii(data, vo, Math.min(valueCount, 8))
      ifdFields.push({ tag, name: tagName, value: version })
      continue
    }

    if (tag === MPF_TAG_NUM_IMAGES && type === 4) {
      numberOfImages = valueOrOffset
      ifdFields.push({ tag, name: tagName, value: String(numberOfImages) })
      continue
    }

    if (tag === MPF_TAG_TOTAL_FRAMES && type === 4) {
      totalFrames = valueOrOffset
      ifdFields.push({ tag, name: tagName, value: String(totalFrames) })
      continue
    }

    if (tag === MPF_TAG_MP_ENTRY && type === 7) {
      ifdFields.push({ tag, name: tagName, value: `${Math.floor(valueCount / 16)} 条 MP Entry` })

      const dataOffset = valueCount <= 4 ? entryOffset + 8 : tiffStart + valueOrOffset
      const imageCount = Math.floor(valueCount / 16)

      for (let j = 0; j < imageCount; j++) {
        const base = dataOffset + j * 16
        if (base + 16 > data.length) {
          break
        }

        const attr = read32(base)
        let size = read32(base + 4)
        let offset = read32(base + 8)
        if (offset > data.length && size > 0 && size < data.length) {
          ;[size, offset] = [offset, size]
        } else if (
          size > data.length &&
          offset < data.length &&
          isLikelyJpeg(data, offset) &&
          !isLikelyJpeg(data, size)
        ) {
          ;[size, offset] = [offset, size]
        }
        const dependent1 = read16(base + 12)
        const dependent2 = read16(base + 14)
        const decoded = decodeMpEntryAttr(attr)

        entries.push({
          index: j,
          ...decoded,
          size,
          offset,
          dependent1,
          dependent2,
        })
      }
      continue
    }

    const vo = valueCount <= 4 ? entryOffset + 8 : tiffStart + valueOrOffset
    ifdFields.push({
      tag,
      name: tagName,
      value: formatIfdScalar(read32, type, valueCount, vo, data),
    })
  }

  return { version, numberOfImages, totalFrames, ifdFields, entries }
}

export function parseMpfSegment(
  buffer: ArrayBuffer,
  segOffset: number,
  segLength: number,
): MpfParseResult | null {
  const data = new Uint8Array(buffer)
  const mpfOffset = findMpfOffset(data, segOffset, segLength)
  if (mpfOffset < 0) {
    return null
  }

  const tiffStart = mpfOffset + 4
  if (tiffStart + 8 > data.length) {
    return null
  }

  const endian = data[tiffStart]! | (data[tiffStart + 1]! << 8)
  const le = endian === 0x4949
  const be = endian === 0x4d4d
  if (!le && !be) {
    return null
  }

  const read16 = (o: number) => (le ? data[o]! | (data[o + 1]! << 8) : (data[o]! << 8) | data[o + 1]!)
  const read32 = (o: number) =>
    le
      ? data[o]! | (data[o + 1]! << 8) | (data[o + 2]! << 16) | (data[o + 3]! << 24)
      : (data[o]! << 24) | (data[o + 1]! << 16) | (data[o + 2]! << 8) | data[o + 3]!

  if (read16(tiffStart + 2) !== 42) {
    return null
  }

  const ifdRel = read32(tiffStart + 4)
  const ifdOffset = tiffStart + ifdRel
  const parsed = parseIfd(data, ifdOffset, tiffStart, read16, read32)

  const rawEntries = parsed.entries ?? []
  return {
    version: parsed.version ?? null,
    numberOfImages: parsed.numberOfImages ?? null,
    totalFrames: parsed.totalFrames ?? null,
    ifdFields: parsed.ifdFields ?? [],
    entries: normalizeMpfEntries(buffer, rawEntries),
  }
}

function findContainerItemForEntry(
  entry: MpfImageEntry,
  containerItems: XmpContainerItem[],
): XmpContainerItem | undefined {
  if (entry.imageType === 0x50000) {
    const gain = containerItems.find((item) => item.semantic === 'GainMap')
    if (gain) {
      return gain
    }
  }
  if (entry.imageType === 0x30000 || entry.index === 0) {
    const primary = containerItems.find((item) => item.semantic === 'Primary')
    if (primary) {
      return primary
    }
  }
  const jpegItems = containerItems.filter((item) => item.mime.startsWith('image/'))
  return jpegItems[entry.index] ?? containerItems[entry.index]
}

/** XMP Container 中 GainMap Item:Length 常为 0，用 MPF MPImageLength 补全后再推算尾堆叠偏移。 */
function effectiveContainerLengths(
  entries: MpfImageEntry[],
  containerItems: XmpContainerItem[],
): XmpContainerItem[] {
  return containerItems.map((item) => {
    if (item.length > 0) {
      return item
    }
    if (item.semantic === 'GainMap') {
      const mpfGain = entries.find((e) => e.imageType === 0x50000)
      if (mpfGain && mpfGain.size > 0) {
        return { ...item, length: mpfGain.size }
      }
    }
    return item
  })
}

/** GainMap 尾堆叠：fileSize − MotionPhoto(Length+Padding) − GainMap(Length+Padding)。 */
function resolveGainMapTailOffset(
  fileSize: number,
  gainLength: number,
  gainPadding: number,
  containerItems: XmpContainerItem[],
): number | undefined {
  if (gainLength <= 0 || fileSize <= 0) {
    return undefined
  }
  const motion = containerItems.find((item) => item.semantic === 'MotionPhoto')
  const motionBytes =
    motion && motion.length > 0 ? motion.length + motion.padding : 0
  if (motionBytes <= 0) {
    return undefined
  }
  return Math.max(0, fileSize - motionBytes - gainLength - gainPadding)
}

export function mpfEntryOverlapsPrimary(
  entry: MpfImageEntry,
  allEntries: MpfImageEntry[],
): boolean {
  return mpfRangeOverlapsPrimary(entry, allEntries)
}

export function enrichMpfEntriesWithContainer(
  entries: MpfImageEntry[],
  containerItems: XmpContainerItem[] | null,
  fileSize?: number,
  xmpXml?: string | null,
): MpfImageEntry[] {
  if (!containerItems?.length) {
    return entries
  }

  let items = xmpXml ? patchMotionPhotoLengthFromXml(containerItems, xmpXml) : containerItems
  const effectiveItems = effectiveContainerLengths(entries, items)
  const resolved =
    fileSize != null && fileSize > 0
      ? resolveContainerItemOffsets(fileSize, effectiveItems)
      : effectiveItems

  return entries.map((entry) => {
    const container = findContainerItemForEntry(entry, resolved)
    if (!container) {
      return entry
    }

    const xmpLength =
      container.length > 0 ? container.length : entry.size > 0 ? entry.size : 0

    let xmpOffset = container.offset
    if (
      (xmpOffset == null || xmpOffset <= 0) &&
      xmpLength > 0 &&
      fileSize != null &&
      fileSize > 0 &&
      container.semantic === 'GainMap'
    ) {
      xmpOffset = resolveGainMapTailOffset(
        fileSize,
        xmpLength,
        container.padding,
        resolved,
      )
    }

    return {
      ...entry,
      semantic: container.semantic,
      xmpOffset,
      xmpLength: xmpLength > 0 ? xmpLength : undefined,
    }
  })
}

/** @deprecated MPF 展示请用 parseMpfSegment；此函数仅保留供 Container 交叉引用测试。 */
export function parseMpfWithContainer(
  buffer: ArrayBuffer,
  segOffset: number,
  segLength: number,
  _containerItems: XmpContainerItem[] | null,
): MpfParseResult | null {
  return parseMpfSegment(buffer, segOffset, segLength)
}

export function buildMpfReadable(result: MpfParseResult): ReadablePayload {
  const fields: ReadableField[] = [
    { key: '规范', value: 'CIPA DC-007 MPF (ExifTool MPF Tags)' },
  ]

  for (const ifd of result.ifdFields) {
    fields.push({ key: ifd.name, value: ifd.value })
  }

  if (result.version && !result.ifdFields.some((f) => f.name === 'MPFVersion')) {
    fields.push({ key: 'MPFVersion', value: result.version })
  }
  if (result.numberOfImages != null && !result.ifdFields.some((f) => f.name === 'NumberOfImages')) {
    fields.push({ key: 'NumberOfImages', value: String(result.numberOfImages) })
  }
  if (result.totalFrames != null && !result.ifdFields.some((f) => f.name === 'TotalFrames')) {
    fields.push({ key: 'TotalFrames', value: String(result.totalFrames) })
  }

  if (result.entries.length === 0) {
    fields.push({ key: '提示', value: '未解析到 MPImageList (MP Entry) 条目' })
  }

  for (const entry of result.entries) {
    fields.push(...buildMpImageEntryFields(entry))
  }

  return { title: 'MPF 多图象素功能段', fields: [
    { key: 'ExifTool Tag ID', value: 'APP2' },
    { key: 'ExifTool Tag Name', value: 'MPF' },
    { key: 'ExifTool 规范', value: 'https://exiftool.org/TagNames/MPF.html' },
    ...fields,
  ] }
}

/** 在 MP Entry 声明的 [offset, offset+size) 内提取 JPEG，不扫描全文件 SOI */
export function extractJpegFromMpfByteRange(
  data: Uint8Array,
  offset: number,
  size: number,
): Uint8Array | null {
  if (size <= 0 || offset < 0 || offset >= data.length) {
    return null
  }

  const rangeEnd = Math.min(data.length, offset + size)
  if (rangeEnd - offset < 2) {
    return null
  }

  let start = offset
  if (!isLikelyJpeg(data, start)) {
    let found = -1
    for (let i = offset; i < rangeEnd - 1; i++) {
      if (isLikelyJpeg(data, i)) {
        found = i
        break
      }
    }
    if (found < 0) {
      return null
    }
    start = found
  }

  for (let i = start + 2; i < rangeEnd - 1; i++) {
    if (data[i] !== 0xff) {
      continue
    }
    if (data[i + 1] === 0xd9) {
      return data.slice(start, i + 2)
    }
    if (data[i + 1] === 0xd8 && i > start + 4) {
      return data.slice(start, i)
    }
  }

  return data.slice(start, rangeEnd)
}

function hasExplicitMpfRange(entry: MpfImageEntry, fileSize: number): boolean {
  return entry.size > 0 && entry.offset >= 0 && entry.offset + entry.size <= fileSize
}

/** 从 hint 附近定位 SOI，并截断到 EOI 或下一张 SOI（适配 MPO 无中间 EOI 的拼接结构）。 */
export function extractEmbeddedJpegRange(
  data: Uint8Array,
  hintOffset: number,
  hintSize: number,
  maxEndExclusive?: number,
): { offset: number; length: number } | null {
  if (hintOffset < 0 || hintOffset >= data.length) {
    return null
  }

  const searchEnd = Math.min(
    data.length,
    maxEndExclusive ?? (hintSize > 0 ? hintOffset + hintSize : data.length),
  )

  let start = hintOffset
  if (!isLikelyJpeg(data, start)) {
    let found = -1
    const scanEnd = Math.min(searchEnd, hintOffset + 512)
    for (let i = hintOffset; i < scanEnd - 1; i++) {
      if (isLikelyJpeg(data, i)) {
        found = i
        break
      }
    }
    if (found < 0) {
      return null
    }
    start = found
  }

  let end = searchEnd
  let bounded = false
  for (let i = start + 2; i < end - 1; i++) {
    if (data[i] !== 0xff) {
      continue
    }
    if (data[i + 1] === 0xd9) {
      end = i + 2
      bounded = true
      break
    }
    if (data[i + 1] === 0xd8 && i > start + 4) {
      end = i
      bounded = true
      break
    }
  }

  if (!bounded) {
    const extendedEnd = Math.min(
      data.length,
      maxEndExclusive ?? data.length,
      start + Math.max(hintSize, 65536),
    )
    for (let i = end; i < extendedEnd - 1; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xd9) {
        end = i + 2
        break
      }
    }
  }

  if (end - start < 4) {
    return null
  }
  return { offset: start, length: end - start }
}

function endsWithEoi(data: Uint8Array, offset: number, length: number): boolean {
  const end = offset + length
  return end >= 2 && data[end - 2] === 0xff && data[end - 1] === 0xd9
}

/** 枚举文件中候选 JPEG 起点（SOI）；MPO 通常仅前若干处为真起点。 */
function listCandidateSoiOffsets(data: Uint8Array): number[] {
  const offsets: number[] = []
  for (let i = 0; i < data.length - 1; i++) {
    if (!isLikelyJpeg(data, i)) {
      continue
    }
    if (i > 0 && data[i - 1] === 0xff) {
      continue
    }
    offsets.push(i)
    if (offsets.length >= 8) {
      break
    }
  }
  return offsets
}

function extractJpegFromSoi(data: Uint8Array, soiOffset: number, maxEnd = data.length): Uint8Array | null {
  const range = extractEmbeddedJpegRange(data, soiOffset, maxEnd - soiOffset, maxEnd)
  if (!range) {
    return null
  }
  return data.slice(range.offset, range.offset + range.length)
}

function isCompleteJpeg(bytes: Uint8Array | null): bytes is Uint8Array {
  return bytes != null && bytes.length >= 4 && isLikelyJpeg(bytes, 0) && endsWithEoi(bytes, 0, bytes.length)
}

function mpfRangeOverlapsPrimary(entry: MpfImageEntry, allEntries: MpfImageEntry[]): boolean {
  if (entry.index === 0 || entry.size <= 0) {
    return false
  }
  const primary = allEntries.find((e) => e.index === 0)
  if (!primary || primary.size <= 0) {
    return false
  }
  const primaryEnd = primary.offset + primary.size
  return entry.offset < primaryEnd
}

function buildFromMpfEntry(
  buffer: ArrayBuffer,
  entry: MpfImageEntry,
  allEntries: MpfImageEntry[],
): Uint8Array | null {
  const data = new Uint8Array(buffer)

  if (entry.index === 0 && entry.offset === 0) {
    return data
  }

  const sorted = [...allEntries].sort((a, b) => a.offset - b.offset)
  const selfIdx = sorted.findIndex((e) => e.index === entry.index)
  const next = selfIdx >= 0 ? sorted[selfIdx + 1] : undefined

  let hintSize = entry.size
  if (hintSize <= 0 && next) {
    hintSize = next.offset - entry.offset
  } else if (hintSize <= 0) {
    hintSize = data.length - entry.offset
  }

  const scanLimit = next && next.offset > entry.offset ? next.offset : data.length

  let start = entry.offset
  if (!isLikelyJpeg(data, start)) {
    let found = -1
    for (let i = entry.offset; i < Math.min(scanLimit, entry.offset + 4096) - 1; i++) {
      if (isLikelyJpeg(data, i)) {
        found = i
        break
      }
    }
    if (found < 0) {
      return null
    }
    start = found
  }

  for (let i = start + 2; i < data.length - 1; i++) {
    if (data[i] !== 0xff) {
      continue
    }
    if (data[i + 1] === 0xd9) {
      return data.slice(start, i + 2)
    }
    if (data[i + 1] === 0xd8 && i > start + 4 && i < scanLimit) {
      break
    }
  }

  const range = extractEmbeddedJpegRange(data, entry.offset, hintSize, scanLimit)
  if (!range) {
    return null
  }

  const slice = data.slice(range.offset, range.offset + range.length)
  if (endsWithEoi(slice, 0, slice.length)) {
    return slice
  }

  const withEoi = new Uint8Array(slice.length + 2)
  withEoi.set(slice)
  withEoi[slice.length] = 0xff
  withEoi[slice.length + 1] = 0xd9
  return withEoi
}

/** 提取可解码 JPEG：基于 MP Entry 区间（含 SOI 解析后的 MPImageStart）。 */
export function buildMpfPreviewBytes(
  buffer: ArrayBuffer,
  entry: MpfImageEntry,
  allEntries: MpfImageEntry[],
): Uint8Array | null {
  const data = new Uint8Array(buffer)

  if (entry.index === 0 && entry.offset === 0) {
    return data
  }

  if (hasExplicitMpfRange(entry, data.length)) {
    const fromMpfRange = extractJpegFromMpfByteRange(data, entry.offset, entry.size)
    if (isCompleteJpeg(fromMpfRange)) {
      return fromMpfRange
    }
    if (fromMpfRange && fromMpfRange.length >= 4 && isLikelyJpeg(fromMpfRange, 0)) {
      return fromMpfRange
    }
  }

  const fromEntry = buildFromMpfEntry(buffer, entry, allEntries)
  if (isCompleteJpeg(fromEntry)) {
    return fromEntry
  }

  const soiList = listCandidateSoiOffsets(data)
  const soiOffset = soiList[entry.index]
  if (soiOffset !== undefined) {
    const nextSoi = soiList[entry.index + 1] ?? data.length
    const fromSoi = extractJpegFromSoi(data, soiOffset, nextSoi)
    if (isCompleteJpeg(fromSoi)) {
      return fromSoi
    }
  }

  if (fromEntry && fromEntry.length >= 4 && isLikelyJpeg(fromEntry, 0)) {
    return fromEntry
  }

  return null
}

function isLikelyJpeg(data: Uint8Array, offset: number): boolean {
  return data[offset] === 0xff && data[offset + 1] === 0xd8
}

function createBlobRefFromBytes(bytes: Uint8Array): { kind: 'blobUrl'; url: string; mimeType: string } {
  return {
    kind: 'blobUrl',
    url: URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' })),
    mimeType: 'image/jpeg',
  }
}

export function normalizeMpfEntries(buffer: ArrayBuffer, entries: MpfImageEntry[]): MpfImageEntry[] {
  const data = new Uint8Array(buffer)
  const sorted = [...entries].sort((a, b) => a.offset - b.offset)

  return sorted.map((entry, i) => {
    if (hasExplicitMpfRange(entry, data.length)) {
      const resolvedStart = resolveMpfEntryStart(data, entry.offset, entry.size)
      if (resolvedStart !== entry.offset) {
        return { ...entry, offset: resolvedStart }
      }
      return entry
    }

    const next = sorted[i + 1]
    let hintSize = entry.size
    if (hintSize <= 0 && next) {
      hintSize = next.offset - entry.offset
    } else if (hintSize <= 0) {
      hintSize = data.length - entry.offset
    }

    const range =
      extractEmbeddedJpegRange(data, entry.offset, hintSize, next?.offset) ??
      (next
        ? extractEmbeddedJpegRange(data, entry.offset, Math.max(0, next.offset - entry.offset), next.offset)
        : null)

    if (range) {
      return { ...entry, offset: range.offset, size: range.length }
    }
    return entry
  })
}

/** 在 MP Entry 声明的 [offset, offset+size) 内定位 JPEG SOI，对齐 ExifTool MPImageStart。 */
export function resolveMpfEntryStart(data: Uint8Array, offset: number, size: number): number {
  if (offset < 0 || size <= 0 || offset >= data.length) {
    return offset
  }
  if (isLikelyJpeg(data, offset)) {
    return offset
  }

  const rangeEnd = Math.min(data.length, offset + size)
  for (let i = offset; i < rangeEnd - 1; i++) {
    if (!isLikelyJpeg(data, i)) {
      continue
    }
    if (i > 0 && data[i - 1] === 0xff) {
      continue
    }
    return i
  }
  return offset
}

export function buildMpfGallery(
  buffer: ArrayBuffer,
  result: MpfParseResult,
  sessionId: string,
): GalleryImage[] {
  const gallery: GalleryImage[] = []

  for (const entry of result.entries) {
    const bytes = buildMpfPreviewBytes(buffer, entry, result.entries)
    if (!bytes || bytes.length < 4) {
      continue
    }

    gallery.push({
      label: `图像 ${entry.index + 1} · ${entry.role}`,
      alt: `MPF 图像 ${entry.index + 1}`,
      src: createBlobRefFromBytes(bytes).url,
      contentRef: {
        kind: 'byteRange',
        sessionId,
        offset: entry.offset,
        length: entry.size,
      },
    })
  }

  return gallery
}

export function buildMpfFrameReadable(entry: MpfImageEntry): ReadablePayload {
  const fields = buildMpImageEntryFields(entry).map(({ key, value }) => ({
    key: key.replace(/^MPImage \d+ · /, ''),
    value,
  }))

  const title =
    entry.imageTypeLabel !== 'Undefined'
      ? entry.imageTypeLabel
      : `MPImage ${entry.index + 1}`

  return { title, fields }
}

export function createMpfFrameBlobRef(
  buffer: ArrayBuffer,
  entry: MpfImageEntry,
  allEntries: MpfImageEntry[],
): { kind: 'blobUrl'; url: string; mimeType: string } | null {
  const bytes = buildMpfPreviewBytes(buffer, entry, allEntries)
  if (!bytes || bytes.length < 4) {
    return null
  }
  return createBlobRefFromBytes(bytes)
}

export function mpoFrameIndexFromNodeId(nodeId: string): number | null {
  const match = nodeId.match(/-frame-(\d+)$/)
  return match ? Number(match[1]) : null
}
