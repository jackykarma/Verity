import type { ReadableField, ReadablePayload } from '../shared/types/present.ts'
import { buildContainerReadable, parseXmpContainerItems, resolveContainerItemOffsets } from './XmpContainer.ts'

const XMP_PROPERTY_LABELS: Record<string, string> = {
  'dc:title': '标题',
  'dc:description': '描述',
  'dc:creator': '创作者',
  'dc:rights': '版权',
  'dc:subject': '主题',
  'xmp:CreatorTool': '创建工具',
  'xmp:CreateDate': '创建日期',
  'xmp:ModifyDate': '修改日期',
  'xmp:MetadataDate': '元数据日期',
  'photoshop:Credit': '署名来源',
  'photoshop:Source': '来源',
  'tiff:Make': '相机厂商',
  'tiff:Model': '相机型号',
  'exif:DateTimeOriginal': '拍摄时间',
  'exif:LensModel': '镜头',
  'crs:AlreadyApplied': 'Lightroom 已应用',
}

export function locateXmpXml(payload: Uint8Array): string | null {
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(payload)
  const packetStart = utf8.indexOf('<?xpacket')
  if (packetStart >= 0) {
    return utf8.slice(packetStart)
  }
  const metaStart = utf8.indexOf('<x:xmpmeta')
  if (metaStart >= 0) {
    return utf8.slice(metaStart)
  }
  return null
}

function collectRdfText(node: Element): string {
  const alt = node.querySelector('rdf\\:Alt, Alt')
  if (alt) {
    const items = alt.querySelectorAll('rdf\\:li, li')
    const parts: string[] = []
    items.forEach((li) => {
      const t = li.textContent?.trim()
      if (t) {
        parts.push(t)
      }
    })
    if (parts.length > 0) {
      return parts.join(' / ')
    }
  }
  const seq = node.querySelector('rdf\\:Seq, Seq')
  if (seq) {
    const parts: string[] = []
    seq.querySelectorAll('rdf\\:li, li').forEach((li) => {
      const t = li.textContent?.trim()
      if (t) {
        parts.push(t)
      }
    })
    if (parts.length > 0) {
      return parts.join(', ')
    }
  }
  const bag = node.querySelector('rdf\\:Bag, Bag')
  if (bag) {
    const parts: string[] = []
    bag.querySelectorAll('rdf\\:li, li').forEach((li) => {
      const t = li.textContent?.trim()
      if (t) {
        parts.push(t)
      }
    })
    if (parts.length > 0) {
      return parts.join(', ')
    }
  }
  return node.textContent?.trim() ?? ''
}

function parseXmpWithDom(xml: string): ReadableField[] {
  if (typeof DOMParser === 'undefined') {
    return parseXmpWithRegex(xml)
  }

  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const fields: ReadableField[] = []
  const seen = new Set<string>()

  const descriptions = doc.querySelectorAll('rdf\\:Description, Description')
  descriptions.forEach((desc) => {
    for (const attr of Array.from(desc.attributes)) {
      const name = attr.name
      if (!name.includes(':') || name.startsWith('xmlns') || name.startsWith('rdf:')) {
        continue
      }
      const value = attr.value.trim()
      if (!value || seen.has(name)) {
        continue
      }
      seen.add(name)
      fields.push({ key: XMP_PROPERTY_LABELS[name] ?? name, value })
    }

    for (const child of Array.from(desc.children)) {
      const local = child.localName ? `${child.prefix ? `${child.prefix}:` : ''}${child.localName}` : child.tagName
      const qName = child.tagName.includes(':') ? child.tagName : local
      const value = collectRdfText(child)
      if (!value || seen.has(qName)) {
        continue
      }
      seen.add(qName)
      fields.push({ key: XMP_PROPERTY_LABELS[qName] ?? qName, value })
    }
  })

  return fields
}

function parseXmpWithRegex(xml: string): ReadableField[] {
  const fields: ReadableField[] = []
  const seen = new Set<string>()

  const attrPattern = /(?:dc|xmp|tiff|exif|photoshop|crs):[A-Za-z][A-Za-z0-9]*="([^"]*)"/g
  let match: RegExpExecArray | null
  while ((match = attrPattern.exec(xml)) !== null) {
    const full = match[0]
    const key = full.slice(0, full.indexOf('='))
    const value = match[1]?.trim()
    if (!value || seen.has(key)) {
      continue
    }
    seen.add(key)
    fields.push({ key: XMP_PROPERTY_LABELS[key] ?? key, value })
  }

  const blockPattern =
    /<(dc|xmp|tiff|exif|photoshop|crs):([A-Za-z][A-Za-z0-9]*)[^>]*>([\s\S]*?)<\/\1:\2>/g
  while ((match = blockPattern.exec(xml)) !== null) {
    const key = `${match[1]}:${match[2]}`
    const inner = match[3] ?? ''
    const liMatch = inner.match(/<rdf:li[^>]*>([\s\S]*?)<\/rdf:li>/i)
    const value = (liMatch?.[1] ?? inner).replace(/<[^>]+>/g, '').trim()
    if (!value || seen.has(key)) {
      continue
    }
    seen.add(key)
    fields.push({ key: XMP_PROPERTY_LABELS[key] ?? key, value })
  }

  return fields
}

export function parseXmpFields(xml: string): ReadableField[] {
  const fields = parseXmpWithDom(xml)
  return fields.length > 0 ? fields : parseXmpWithRegex(xml)
}

export function extractXmpFromApp1(app1Slice: ArrayBuffer, fullBuffer?: ArrayBuffer): ReadablePayload {
  const payload = new Uint8Array(app1Slice)
  const xml = locateXmpXml(payload)

  if (!xml) {
    const latin = new TextDecoder('latin1').decode(payload).replace(/\0/g, ' ').trim()
    return {
      title: 'APP1 (XMP)',
      fields: [
        { key: '说明', value: '未识别 XMP 数据包' },
        { key: '摘要', value: latin.slice(0, 512) || '（空）' },
      ],
    }
  }

  const fields = parseXmpFields(xml)
  const containerItems = parseXmpContainerItems(xml)
  const fileSize = fullBuffer?.byteLength ?? app1Slice.byteLength
  const containerFields =
    containerItems.length > 0
      ? buildContainerReadable(resolveContainerItemOffsets(fileSize, containerItems))
      : []
  const preview =
    xml.length > 4000 ? `${xml.slice(0, 4000)}\n…（已截断，共 ${xml.length} 字符）` : xml

  const mergedFields = [...fields, ...containerFields]

  return {
    title: 'XMP 元数据',
    fields:
      mergedFields.length > 0
        ? mergedFields
        : [{ key: '提示', value: '已解析 XMP 包，但未提取到已知属性（见下方 XML）' }],
    textBody: preview,
  }
}
