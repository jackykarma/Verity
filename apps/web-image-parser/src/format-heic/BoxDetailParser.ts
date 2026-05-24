import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { ReadableField, ReadablePayload } from '../shared/types/present.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'
import type { BmffBox } from './BmffReader.ts'
import {
  readFtypBrands,
  readHdlrType,
  readIspeSize,
  readPitmItemId,
} from './boxCatalog.ts'
import {
  infeFields,
  iinfFields,
  parseInfeBox,
  parseIinfHeader,
} from './InfeParser.ts'
import { readGridRotation } from './HeicExifExtractor.ts'
import { parseIpma } from './IpmaParser.ts'
import { parseIrefReferences } from './ItemRefBuilder.ts'
import { hexDumpAt } from './boxHexDump.ts'
import {
  boxRoleSummary,
  explainFtypBrand,
  explainIrefKind,
  HEIF_RENDER_PIPELINE,
} from './heifBoxHelp.ts'
import type { ItemLocation } from './IlocParser.ts'

function roleField(type: string): ReadableField[] {
  const summary = boxRoleSummary(type)
  return summary ? [{ key: 'HEIF 语义', value: summary }] : []
}

function readFullBox(data: Uint8Array, offset: number): { version: number; flags: number } | null {
  if (offset + 12 > data.length) {
    return null
  }
  const version = data[offset + 8]!
  const flags =
    (data[offset + 9]! << 16) | (data[offset + 10]! << 8) | data[offset + 11]!
  return { version, flags }
}

function headerFields(data: Uint8Array, box: BmffBox): ReadableField[] {
  const type =
    box.type === 'tail'
      ? '（无 box 头 · 厂商续区）'
      : String.fromCharCode(data[box.offset + 4]!, data[box.offset + 5]!, data[box.offset + 6]!, data[box.offset + 7]!)
  const fields: ReadableField[] = [
    { key: 'ISO box 类型', value: type },
    { key: 'box 大小 (size)', value: `${box.size.toLocaleString()} 字节` },
    { key: '头大小 (header)', value: `${box.headerSize} 字节` },
    { key: '文件偏移', value: formatByteOffset(box.offset) },
    { key: '目录 ID', value: box.catalogId },
  ]
  const fb = readFullBox(data, box.offset)
  if (fb) {
    fields.push(
      { key: 'FullBox version', value: String(fb.version) },
      { key: 'FullBox flags', value: `0x${fb.flags.toString(16).padStart(6, '0')}` },
    )
  }
  return fields
}

function parseFtyp(data: Uint8Array, box: BmffBox): ReadableField[] {
  const brands = readFtypBrands(data, box.offset, box.size)
  const minor =
    box.size >= 16
      ? ((data[box.offset + 12]! << 24) |
          (data[box.offset + 13]! << 16) |
          (data[box.offset + 14]! << 8) |
          data[box.offset + 15]!) >>>
        0
      : null
  return [
    ...roleField('ftyp'),
    { key: 'major_brand', value: brands[0] ?? '—' },
    ...(brands[0]
      ? [{ key: 'major_brand 含义', value: explainFtypBrand(brands[0]) }]
      : []),
    { key: 'minor_version', value: minor !== null ? String(minor) : '—' },
    {
      key: 'compatible_brands',
      value: brands.slice(1).join(', ') || '—',
    },
    ...(brands.length > 1
      ? [
          {
            key: 'compatible_brands 含义',
            value: brands
              .slice(1)
              .map((b) => `${b}（${explainFtypBrand(b)}）`)
              .join('；'),
          },
        ]
      : []),
  ]
}

function parseHdlr(data: Uint8Array, box: BmffBox): ReadableField[] {
  const handler = readHdlrType(data, box.offset, box.size)?.trim() ?? '—'
  let name = ''
  if (box.offset + 32 < box.offset + box.size) {
    const start = box.offset + 24
    const end = Math.min(box.offset + box.size, start + 64)
    name = new TextDecoder('utf-8', { fatal: false })
      .decode(data.subarray(start, end))
      .replace(/\0.*$/, '')
  }
  const fields: ReadableField[] = [
    ...roleField('hdlr'),
    { key: 'handler_type', value: handler },
    { key: 'handler_name', value: name || '—' },
  ]
  if (handler !== 'pict') {
    fields.push({
      key: 'HEIF 校验',
      value: `handler_type 应为 pict；当前为 ${handler}，可能不是 HEIF 图像文件`,
    })
  } else {
    fields.push({ key: 'HEIF 校验', value: 'handler_type = pict ✓' })
  }
  return fields
}

function parsePitm(data: Uint8Array, box: BmffBox): ReadableField[] {
  const id = readPitmItemId(data, box.offset, box.size)
  return [
    ...roleField('pitm'),
    { key: 'primary_item_id', value: id !== null ? String(id) : '—' },
    {
      key: '渲染入口',
      value: id !== null ? `默认展示 Item #${id}（Wiki §六 步骤 3–4）` : '—',
    },
  ]
}

function parseInfe(data: Uint8Array, box: BmffBox): ReadableField[] {
  const entry = parseInfeBox(data, box.offset, box.size)
  if (!entry) {
    return [{ key: 'error', value: '无法解析 infe 条目' }]
  }
  return infeFields(entry)
}

function parseIinf(data: Uint8Array, box: BmffBox, boxes: BmffBox[]): ReadableField[] {
  const header = parseIinfHeader(data, box.offset, box.size)
  if (!header) {
    return [{ key: 'error', value: '无法解析 iinf 头' }]
  }
  const entries = boxes
    .filter((b) => b.type === 'infe' && b.parentOffset === box.offset)
    .map((b) => parseInfeBox(data, b.offset, b.size))
    .filter((e): e is NonNullable<typeof e> => e !== null)
    .sort((a, b) => a.itemId - b.itemId)
  return [...roleField('iinf'), ...iinfFields(header, entries)]
}

function parseIloc(
  data: Uint8Array,
  box: BmffBox,
  itemLocations: Map<number, ItemLocation>,
): ReadableField[] {
  const fb = readFullBox(data, box.offset)
  const start = box.offset + 12
  const offsetSize = start + 1 <= data.length ? (data[start]! >> 4) & 0x0f : 0
  const lengthSize = start + 1 <= data.length ? data[start]! & 0x0f : 0
  const indexSize = start + 2 <= data.length ? (data[start + 1]! >> 4) & 0x0f : 0
  const baseOffsetSize = start + 2 <= data.length ? data[start + 1]! & 0x0f : 0
  const fields: ReadableField[] = [
    ...roleField('iloc'),
    { key: 'version', value: fb ? String(fb.version) : '—' },
    {
      key: 'offset_size / length_size / index_size / base_offset_size',
      value: `${offsetSize} / ${lengthSize} / ${indexSize} / ${baseOffsetSize}`,
    },
    { key: 'item_count (parsed)', value: String(itemLocations.size) },
    {
      key: '定位公式',
      value: '文件绝对偏移 = base_offset + extent_offset；extent_length 为 Item 字节长度',
    },
  ]
  for (const [id, loc] of [...itemLocations.entries()].sort((a, b) => a[0] - b[0]).slice(0, 100)) {
    fields.push({
      key: `item ${id}`,
      value: `extent @ ${formatByteOffset(loc.offset)}, length ${loc.length}`,
    })
  }
  return fields
}

function parseIref(data: Uint8Array, box: BmffBox): ReadableField[] {
  const refs = parseIrefReferences(data, box)
  return [
    ...roleField('iref'),
    ...refs.flatMap((ref) => [
      { key: `${ref.kind} from_item_ID`, value: String(ref.fromItemId) },
      {
        key: `${ref.kind} 语义`,
        value: explainIrefKind(ref.kind),
      },
      {
        key: `${ref.kind} to_item_IDs`,
        value: ref.toItemIds.length ? ref.toItemIds.join(', ') : '（空）',
      },
    ]),
  ]
}

function parseIspe(data: Uint8Array, box: BmffBox): ReadableField[] {
  const dim = readIspeSize(data, box.offset, box.size)
  return [
    ...roleField('ispe'),
    { key: 'image_width × image_height', value: dim ?? '—' },
  ]
}

function parseColr(data: Uint8Array, box: BmffBox): ReadableField[] {
  const end = box.offset + box.size
  if (box.offset + 16 > end) {
    return [{ key: 'error', value: 'colr 过短' }]
  }
  const colourType = String.fromCharCode(
    data[box.offset + 12]!,
    data[box.offset + 13]!,
    data[box.offset + 14]!,
    data[box.offset + 15]!,
  )
  if (colourType === 'nclx') {
    return [
      ...roleField('colr'),
      { key: 'colour_type', value: 'nclx' },
      { key: 'colour_primaries', value: String((data[box.offset + 16]! << 8) | data[box.offset + 17]!) },
      {
        key: 'transfer_characteristics',
        value: String((data[box.offset + 18]! << 8) | data[box.offset + 19]!),
      },
      { key: 'matrix_coefficients', value: String((data[box.offset + 20]! << 8) | data[box.offset + 21]!) },
      { key: 'full_range_flag', value: (data[box.offset + 22]! & 0x80) ? '1' : '0' },
    ]
  }
  if (colourType === 'rICC' || colourType === 'prof') {
    return [
      { key: 'colour_type', value: colourType },
      { key: 'icc_profile_size', value: String(box.size - 16) },
    ]
  }
  return [{ key: 'colour_type', value: colourType }]
}

function parseHvcC(data: Uint8Array, box: BmffBox): ReadableField[] {
  const p = box.offset + 12
  if (p + 13 > box.offset + box.size) {
    return [{ key: 'error', value: 'hvcC 过短' }]
  }
  const profileByte = data[p + 1]!
  return [
    ...roleField('hvcC'),
    { key: 'configurationVersion', value: String(data[p]!) },
    { key: 'general_profile_idc', value: String(profileByte & 0x1f) },
    { key: 'general_tier_flag', value: String((profileByte >> 5) & 1) },
    { key: 'general_level_idc', value: String(data[p + 12]!) },
    { key: 'chromaFormat', value: String((data[p + 6]! >> 5) & 0x7) },
    { key: 'bitDepthLumaMinus8', value: String(data[p + 6]! & 0x7) },
    { key: 'bitDepthChromaMinus8', value: String(data[p + 7]! & 0x7) },
  ]
}

function parseTransform(data: Uint8Array, box: BmffBox): ReadableField[] {
  const hint = readGridRotation(data, box.offset, box.size)
  const fields: ReadableField[] = [
    ...roleField(box.type.trim()),
    { key: 'box_type', value: box.type },
  ]
  if (box.type.trim() === 'irot' && box.offset + 12 < box.offset + box.size) {
    const angle = data[box.offset + 12]! & 0x03
    fields.push({ key: 'angle', value: String(angle) })
    fields.push({ key: '旋转', value: `${angle * 90}°` })
  }
  if (box.type.trim() === 'imir' && box.offset + 12 < box.offset + box.size) {
    const axis = data[box.offset + 12]! & 0x01
    fields.push({ key: 'axis', value: String(axis) })
    fields.push({ key: '镜像', value: axis === 0 ? '垂直' : '水平' })
  }
  if (hint) {
    fields.push({ key: 'transform', value: hint })
  }
  return fields
}

function parseMediaData(box: BmffBox): ReadableField[] {
  const payload = box.size - box.headerSize
  return [
    ...roleField(box.type.trim()),
    { key: 'payload_size', value: `${payload.toLocaleString()} 字节` },
    {
      key: '数据组织',
      value:
        'mdat 内部无 Item 分隔符；边界由 iloc 的 base_offset + extent_offset + extent_length 定义',
    },
  ]
}

function parseFreeSkip(box: BmffBox): ReadableField[] {
  return [{ key: 'padding_size', value: `${(box.size - box.headerSize).toLocaleString()} 字节` }]
}

function parseContainer(box: BmffBox, boxes: BmffBox[]): ReadableField[] {
  const children = boxes.filter((b) => b.parentOffset === box.offset)
  const fields: ReadableField[] = [
    ...roleField(box.type.trim()),
    { key: 'child_count', value: String(children.length) },
    { key: 'child_types', value: [...new Set(children.map((c) => c.type))].join(', ') || '—' },
  ]
  if (box.type.trim() === 'meta') {
    fields.push({
      key: 'HEIF 渲染链',
      value: HEIF_RENDER_PIPELINE.join(' → '),
    })
  }
  if (box.type.trim() === 'iprp') {
    fields.push({
      key: '子 Box 职责',
      value: 'ipco 定义属性池；ipma 将属性索引（1-based）绑定到 Item',
    })
  }
  return fields
}

function parseItemPayload(
  box: BmffBox,
  itemLocations: Map<number, ItemLocation>,
): ReadableField[] {
  if (box.itemId === undefined) {
    return []
  }
  const loc = itemLocations.get(box.itemId)
  if (!loc) {
    return [{ key: 'iloc', value: '未索引到此 item 的数据位置' }]
  }
  return [
    { key: 'item_ID', value: String(box.itemId) },
    { key: 'item_type', value: box.itemType?.trim() ?? '—' },
    { key: 'data_offset', value: formatByteOffset(loc.offset) },
    { key: 'data_length', value: `${loc.length.toLocaleString()} 字节` },
  ]
}

function parseByBoxType(
  data: Uint8Array,
  box: BmffBox,
  boxes: BmffBox[],
  itemLocations: Map<number, ItemLocation>,
): ReadableField[] {
  switch (box.type) {
    case 'ftyp':
      return parseFtyp(data, box)
    case 'meta':
    case 'iprp':
    case 'ipco':
    case 'moov':
    case 'trak':
    case 'mdia':
    case 'minf':
    case 'stbl':
      return parseContainer(box, boxes)
    case 'hdlr':
      return parseHdlr(data, box)
    case 'pitm':
      return parsePitm(data, box)
    case 'iinf':
      return parseIinf(data, box, boxes)
    case 'infe':
      return [...roleField('infe'), ...parseInfe(data, box), ...parseItemPayload(box, itemLocations)]
    case 'iloc':
      return parseIloc(data, box, itemLocations)
    case 'iref':
      return parseIref(data, box)
    case 'ipma': {
      const entries = parseIpma(data, box)
      if (entries.length === 0) {
        return [...roleField('ipma'), { key: '提示', value: '无条目' }]
      }
      return [
        ...roleField('ipma'),
        ...entries.flatMap((e) =>
          e.associations.map((a, i) => ({
            key: `item ${e.itemId} assoc ${i + 1}`,
            value: a.essential
              ? `essential · ipco 属性 #${a.propertyIndex}`
              : `ipco 属性 #${a.propertyIndex}`,
          })),
        ),
      ]
    }
    case 'ispe':
      return parseIspe(data, box)
    case 'colr':
      return parseColr(data, box)
    case 'hvcC':
      return parseHvcC(data, box)
    case 'irot':
    case 'imir':
    case 'clap':
      return parseTransform(data, box)
    case 'mdat':
    case 'idat':
      return parseMediaData(box)
    case 'free':
    case 'skip':
      return parseFreeSkip(box)
    case 'QTI ':
      return [
        { key: 'vendor', value: 'Qualcomm QTI Debug Metadata' },
        { key: 'payload_size', value: `${(box.size - 8).toLocaleString()} 字节` },
      ]
    case 'tail':
      return [
        { key: '说明', value: '厂商未封装媒体续区（无 BMFF box 头）' },
        { key: 'size', value: `${box.size.toLocaleString()} 字节` },
      ]
    default:
      return box.itemId !== undefined ? parseItemPayload(box, itemLocations) : []
  }
}

function boxSliceRange(
  buffer: ArrayBuffer,
  box: BmffBox,
  itemLocations: Map<number, ItemLocation>,
): { offset: number; length: number } {
  if (box.type === 'infe' && box.itemId !== undefined) {
    const loc = itemLocations.get(box.itemId)
    if (loc) {
      return { offset: loc.offset, length: loc.length }
    }
  }
  return { offset: box.offset, length: box.size }
}

function resolveBoxForNode(node: SegmentNodeDto, boxes: BmffBox[]): BmffBox | undefined {
  const byOffset = boxes.find((b) => b.offset === node.offset)
  if (byOffset) {
    return byOffset
  }
  const match = node.label.match(/#(\d+)/)
  if (match) {
    const itemId = Number(match[1])
    return boxes.find((b) => b.type === 'infe' && b.itemId === itemId)
  }
  return undefined
}

export function buildBoxDetailReadable(
  node: SegmentNodeDto,
  buffer: ArrayBuffer,
  boxes: BmffBox[],
  itemLocations: Map<number, ItemLocation>,
): ReadablePayload | null {
  const box = resolveBoxForNode(node, boxes)
  if (!box) {
    if (node.id.startsWith('iref-link-') || node.id === 'grid-tiles-group') {
      return {
        title: node.label,
        fields: [
          { key: '目录 ID', value: node.parCatalogId },
          { key: '说明', value: node.label },
        ],
      }
    }
    return null
  }

  const data = new Uint8Array(buffer)
  const parsed = parseByBoxType(data, box, boxes, itemLocations)
  const { offset, length } = boxSliceRange(buffer, box, itemLocations)

  return {
    title: `${box.type.trim() || box.type} · ${node.label}`,
    fields: [...headerFields(data, box), ...parsed],
    hexPreview: hexDumpAt(buffer, offset, length),
  }
}

/** @deprecated 使用 buildBoxDetailReadable */
export function buildMetadataBoxReadable(
  node: SegmentNodeDto,
  buffer: ArrayBuffer,
  boxes: BmffBox[],
  itemLocations: Map<number, ItemLocation>,
): ReadablePayload | null {
  return buildBoxDetailReadable(node, buffer, boxes, itemLocations)
}

export function isHeicMetadataCatalog(_parCatalogId: string): boolean {
  return true
}
