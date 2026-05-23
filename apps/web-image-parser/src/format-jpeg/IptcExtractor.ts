import type { ReadableField, ReadablePayload } from '../shared/types/present.ts'

const IPTC_LABELS: Record<string, string> = {
  Headline: '标题',
  Caption: '说明',
  Keywords: '关键词',
  Copyright: '版权',
  Byline: '署名',
  Credit: '来源',
  Source: '来源机构',
  City: '城市',
  Country: '国家',
  Category: '分类',
  SupplementalCategories: '补充分类',
  ObjectName: '对象名称',
  SpecialInstructions: '特殊说明',
}

export async function extractIptcFields(buffer: ArrayBuffer): Promise<ReadableField[]> {
  const exifr = (await import('exifr')).default
  try {
    const parsed = (await exifr.parse(buffer, { iptc: true, mergeOutput: true })) as Record<
      string,
      unknown
    > | null
    if (!parsed) {
      return []
    }

    const fields: ReadableField[] = []
    for (const [key, value] of Object.entries(parsed)) {
      if (key in IPTC_LABELS || key.startsWith('IPTC')) {
        fields.push({
          key: IPTC_LABELS[key] ?? key,
          value: Array.isArray(value) ? value.join(', ') : String(value),
        })
      }
    }
    return fields
  } catch {
    return []
  }
}

export async function extractIptcFromApp13(app13Slice: ArrayBuffer): Promise<ReadablePayload> {
  const fields = await extractIptcFields(app13Slice)
  if (fields.length > 0) {
    return { title: 'IPTC 元数据', fields }
  }

  const text = new TextDecoder('latin1').decode(app13Slice).replace(/\0/g, ' ').trim()
  const readable = text.slice(0, 512)
  return {
    title: 'IPTC / Photoshop 段',
    fields: [
      { key: '说明', value: '未识别标准 IPTC 字段，展示文本摘要' },
      { key: '摘要', value: readable || '（空）' },
    ],
  }
}

export async function extractIptcReadable(buffer: ArrayBuffer): Promise<ReadablePayload> {
  const fields = await extractIptcFields(buffer)
  return {
    title: 'IPTC 元数据',
    fields: fields.length > 0 ? fields : [{ key: '提示', value: '无 IPTC 字段' }],
  }
}
