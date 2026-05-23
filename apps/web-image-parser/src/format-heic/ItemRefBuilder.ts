import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'

export interface ItemReference {
  kind: string
  fromItemId: number
  toItemIds: number[]
  catalogId: string
  label: string
}

const REF_CATALOG: Record<string, { catalogId: string; label: string }> = {
  thmb: { catalogId: 'PAR-HEIC-C01', label: '主图↔缩略图' },
  dimg: { catalogId: 'PAR-HEIC-302', label: 'Live Photo 关联' },
  auxl: { catalogId: 'PAR-HEIC-C04', label: 'HDR 增益关联' },
  dpnd: { catalogId: 'PAR-HEIC-C06', label: '深度图关联' },
}

export function parseIrefReferences(data: Uint8Array, irefBox: BmffBox): ItemReference[] {
  const refs: ItemReference[] = []
  const end = irefBox.offset + irefBox.size
  let offset = irefBox.offset + 12

  while (offset + 8 <= end) {
    const size =
      (data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!
    const type = String.fromCharCode(
      data[offset + 4]!,
      data[offset + 5]!,
      data[offset + 6]!,
      data[offset + 7]!,
    )
    if (size < 14 || !/^[\x20-\x7e]{4}$/.test(type)) {
      break
    }

    const fromId = (data[offset + 12]! << 8) | data[offset + 13]!
    const count = (data[offset + 14]! << 8) | data[offset + 15]!
    const toIds: number[] = []
    for (let i = 0; i < count; i++) {
      const toOff = offset + 16 + i * 2
      if (toOff + 1 >= end) {
        break
      }
      toIds.push((data[toOff]! << 8) | data[toOff + 1]!)
    }

    const meta = REF_CATALOG[type] ?? { catalogId: 'PAR-HEIC-010', label: `${type} 引用` }
    refs.push({
      kind: type,
      fromItemId: fromId,
      toItemIds: toIds,
      catalogId: meta.catalogId,
      label: `${meta.label}：项 #${fromId} → ${toIds.map((id) => `#${id}`).join(', ')}`,
    })

    offset += size
  }

  return refs
}

export function appendReferenceNodes(
  nodes: SegmentNodeDto[],
  boxes: BmffBox[],
  buffer: ArrayBuffer,
): string[] {
  const data = new Uint8Array(buffer)
  const warnings: string[] = []
  let refIndex = 0

  for (const box of boxes) {
    if (box.type !== 'iref') {
      continue
    }
    const parentId = nodes.find((n) => n.offset === box.offset)?.id
    if (!parentId) {
      continue
    }

    const refs = parseIrefReferences(data, box)
    for (const ref of refs) {
      nodes.push({
        id: `iref-link-${refIndex++}`,
        parentId,
        label: ref.label,
        parCatalogId: ref.catalogId,
        offset: box.offset,
        length: box.size,
        loadType: ref.kind === 'dimg' ? 'mixed' : 'metadata',
        warning: false,
      })
      if (ref.kind === 'dimg') {
        warnings.push(`Live Photo 关联：项 #${ref.fromItemId} ↔ ${ref.toItemIds.join(', #')}`)
      }
    }
  }

  return warnings
}
