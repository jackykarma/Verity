import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'
import { formatIpmaSummary, parseIpma } from './IpmaParser.ts'

export function enrichIpmaLabels(nodes: SegmentNodeDto[], boxes: BmffBox[], buffer: ArrayBuffer): void {
  const data = new Uint8Array(buffer)

  for (const node of nodes) {
    const box = boxes.find((b) => b.offset === node.offset && b.type === 'ipma')
    if (!box) {
      continue
    }
    const entries = parseIpma(data, box)
    node.label = formatIpmaSummary(entries)
    node.parCatalogId = 'PAR-HEIC-009'
  }
}

export function buildIpmaReadable(
  buffer: ArrayBuffer,
  box: BmffBox,
): { title: string; fields: { key: string; value: string }[] } {
  const data = new Uint8Array(buffer)
  const entries = parseIpma(data, box)
  const fields = entries.flatMap((e) =>
    e.associations.map((a, i) => ({
      key: `项 #${e.itemId} · 属性 ${i + 1}`,
      value: a.essential
        ? `essential · index ${a.propertyIndex}`
        : `index ${a.propertyIndex}`,
    })),
  )
  return {
    title: 'ipma 属性关联矩阵',
    fields: fields.length > 0 ? fields : [{ key: '提示', value: '无关联条目' }],
  }
}
