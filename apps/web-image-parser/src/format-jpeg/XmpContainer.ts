import { locateXmpXml } from './XmpExtractor.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'

export interface XmpContainerItem {
  index: number
  semantic: string
  mime: string
  length: number
  padding: number
  offset?: number
}

const SEMANTIC_LABELS: Record<string, string> = {
  Primary: '主图 (Primary)',
  GainMap: 'HDR 增益图 (GainMap)',
  MotionPhoto: '动态照片 (MotionPhoto)',
  MotionPhotoPresentationTimestampUs: '动态照片时间戳',
  Alternate: '备选视图 (Alternate)',
}

export function semanticDisplayLabel(semantic: string): string {
  return SEMANTIC_LABELS[semantic] ?? semantic
}

function readItemAttr(block: string, name: string): string {
  const patterns = [
    new RegExp(`Item:${name}="([^"]*)"`, 'i'),
    new RegExp(`Item\\:${name}="([^"]*)"`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = block.match(pattern)
    if (match?.[1] !== undefined) {
      return match[1]
    }
  }
  return ''
}

function parseContainerItemsWithRegex(xml: string): XmpContainerItem[] {
  if (!xml.includes('Container:') && !xml.includes('Item:Semantic')) {
    return []
  }

  const items: XmpContainerItem[] = []
  const liPattern = /<rdf:li[\s\S]*?<\/rdf:li>/gi
  let match: RegExpExecArray | null
  while ((match = liPattern.exec(xml)) !== null) {
    const block = match[0] ?? ''
    if (!block.includes('Container:Item') && !block.includes('Item:Semantic')) {
      continue
    }
    items.push({
      index: items.length,
      mime: readItemAttr(block, 'Mime') || '未知',
      semantic: readItemAttr(block, 'Semantic') || 'Unknown',
      length: Number.parseInt(readItemAttr(block, 'Length') || '0', 10) || 0,
      padding: Number.parseInt(readItemAttr(block, 'Padding') || '0', 10) || 0,
    })
  }
  return items
}

function parseContainerItemsWithDom(xml: string): XmpContainerItem[] {
  if (typeof DOMParser === 'undefined') {
    return parseContainerItemsWithRegex(xml)
  }

  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const items: XmpContainerItem[] = []
  const nodes = doc.querySelectorAll('Container\\:Item, Item, [localName="Item"]')

  nodes.forEach((node) => {
    const el = node as Element
    const mime = el.getAttribute('Item:Mime') ?? el.getAttribute('Mime') ?? ''
    const semantic = el.getAttribute('Item:Semantic') ?? el.getAttribute('Semantic') ?? ''
    if (!mime && !semantic) {
      return
    }
    items.push({
      index: items.length,
      mime: mime || '未知',
      semantic: semantic || 'Unknown',
      length: Number.parseInt(el.getAttribute('Item:Length') ?? el.getAttribute('Length') ?? '0', 10) || 0,
      padding: Number.parseInt(el.getAttribute('Item:Padding') ?? el.getAttribute('Padding') ?? '0', 10) || 0,
    })
  })

  return items.length > 0 ? items : parseContainerItemsWithRegex(xml)
}

export function parseXmpContainerItems(xml: string): XmpContainerItem[] {
  return parseContainerItemsWithDom(xml)
}

/** OPPO / 部分厂商 MotionPhoto Item:Length 为 0，视频长度写在 OpCamera:VideoLength 等字段。 */
export function patchMotionPhotoLengthFromXml(
  items: XmpContainerItem[],
  xml: string,
): XmpContainerItem[] {
  const motion = items.find((item) => item.semantic === 'MotionPhoto')
  if (!motion || motion.length > 0) {
    return items
  }

  const patterns = [
    /OpCamera:VideoLength="(\d+)"/i,
    /(?:Camera|oplus):VideoLength="(\d+)"/i,
    /<[^>]*VideoLength="(\d+)"/i,
  ]
  for (const pattern of patterns) {
    const match = xml.match(pattern)
    if (match?.[1]) {
      const length = Number.parseInt(match[1], 10)
      if (length > 0) {
        return items.map((item) =>
          item.semantic === 'MotionPhoto' ? { ...item, length } : item,
        )
      }
    }
  }

  return items
}

function scanApp1XmpXml(data: Uint8Array): string | null {
  const candidates: string[] = []

  for (let i = 0; i + 4 < data.length; i++) {
    if (data[i] !== 0xff || data[i + 1] !== 0xe1) {
      continue
    }
    const segLen = (data[i + 2]! << 8) | data[i + 3]!
    if (segLen < 4 || i + 2 + segLen > data.length) {
      continue
    }
    const xml = locateXmpXml(data.slice(i + 4, i + 2 + segLen))
    if (xml && (xml.includes('Container:') || xml.includes('Item:Semantic'))) {
      candidates.push(xml)
    }
  }

  return (
    candidates.find((xml) => xml.includes('GainMap')) ??
    candidates.find((xml) => xml.includes('MotionPhoto')) ??
    candidates[0] ??
    null
  )
}

/** Motion Photo / Ultra HDR：非 Primary 条目自文件尾向前堆叠。 */
export function resolveContainerItemOffsets(
  fileSize: number,
  items: XmpContainerItem[],
): XmpContainerItem[] {
  const tailSumAfter = new Array<number>(items.length).fill(0)
  let accumulated = 0

  for (let i = items.length - 1; i >= 0; i--) {
    tailSumAfter[i] = accumulated
    const item = items[i]
    if (item && item.length > 0) {
      accumulated += item.length + item.padding
    }
  }

  return items.map((item, i) => ({
    ...item,
    offset:
      item.length > 0
        ? Math.max(0, fileSize - tailSumAfter[i]! - item.length - item.padding)
        : undefined,
  }))
}

export function findXmpContainerInBuffer(buffer: ArrayBuffer): XmpContainerItem[] | null {
  const data = new Uint8Array(buffer)
  const xml =
    scanApp1XmpXml(data) ??
    locateXmpXml(data.slice(0, Math.min(data.length, 512 * 1024)))
  if (!xml || (!xml.includes('Container:') && !xml.includes('Item:Semantic'))) {
    return null
  }

  let items = parseXmpContainerItems(xml)
  if (items.length === 0) {
    return null
  }

  items = patchMotionPhotoLengthFromXml(items, xml)
  return resolveContainerItemOffsets(buffer.byteLength, items)
}

/** 读取 XMP 包文本（供 enrich 补全 Container 长度）。 */
export function findXmpXmlInBuffer(buffer: ArrayBuffer): string | null {
  const data = new Uint8Array(buffer)
  return scanApp1XmpXml(data) ?? locateXmpXml(data.slice(0, Math.min(data.length, 512 * 1024)))
}

export function jpegContainerItems(items: XmpContainerItem[]): XmpContainerItem[] {
  return items.filter((item) => item.mime.startsWith('image/'))
}

export function buildContainerReadable(items: XmpContainerItem[]): { key: string; value: string }[] {
  const fields: { key: string; value: string }[] = []

  for (const item of items) {
    const label = semanticDisplayLabel(item.semantic)
    const prefix = `Container · ${label}`
    fields.push({ key: `${prefix} · Item:Mime`, value: item.mime })
    fields.push({ key: `${prefix} · Item:Length`, value: String(item.length) })
    fields.push({ key: `${prefix} · Item:Padding`, value: String(item.padding) })
    if (item.length > 0 && item.offset != null && item.offset > 0) {
      fields.push({ key: `${prefix} · 推算偏移`, value: formatByteOffset(item.offset) })
    }
  }

  return fields
}
