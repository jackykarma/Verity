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
  dimg: { catalogId: 'PAR-HEIC-C03', label: '网格分块关联' },
  auxl: { catalogId: 'PAR-HEIC-C04', label: 'HDR 增益关联' },
  dpnd: { catalogId: 'PAR-HEIC-C06', label: '深度图关联' },
  cdsc: { catalogId: 'PAR-HEIC-010', label: '内容描述关联' },
}

/** Parse SingleItemTypeReferenceBox inside iref (FullBox + from_id + to_item_IDs). */
function parseSingleItemRef(
  data: Uint8Array,
  offset: number,
  size: number,
): { fromId: number; toIds: number[] } | null {
  if (size < 14) {
    return null
  }
  const boxEnd = offset + size
  const fromId = (data[offset + 12]! << 8) | data[offset + 13]!
  const payloadStart = offset + 14
  const payloadLen = size - 14
  if (payloadLen <= 0) {
    return { fromId, toIds: [] }
  }
  if (payloadLen % 2 !== 0) {
    return null
  }

  const explicitCount = (data[payloadStart]! << 8) | data[payloadStart + 1]!
  const explicitEnd = payloadStart + 2 + explicitCount * 2
  if (explicitCount > 0 && explicitEnd === boxEnd) {
    const toIds: number[] = []
    for (let i = 0; i < explicitCount; i++) {
      const toOff = payloadStart + 2 + i * 2
      toIds.push((data[toOff]! << 8) | data[toOff + 1]!)
    }
    return { fromId, toIds }
  }

  // Some encoders (e.g. OPPO grid HEIC) omit reference_count; payload is only to_item_ID list.
  const toIds: number[] = []
  for (let i = 0; i < payloadLen; i += 2) {
    toIds.push((data[payloadStart + i]! << 8) | data[payloadStart + i + 1]!)
  }
  return { fromId, toIds }
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

    const parsed = parseSingleItemRef(data, offset, size)
    if (!parsed) {
      break
    }

    const meta = REF_CATALOG[type] ?? { catalogId: 'PAR-HEIC-010', label: `${type} 引用` }
    refs.push({
      kind: type,
      fromItemId: parsed.fromId,
      toItemIds: parsed.toIds,
      catalogId: meta.catalogId,
      label: `${meta.label}：项 #${parsed.fromId} → ${parsed.toIds.map((id) => `#${id}`).join(', ')}`,
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
        loadType: ref.kind === 'dimg' ? 'image' : 'metadata',
        warning: false,
      })
      if (ref.kind === 'dimg' && ref.toItemIds.length > 0) {
        warnings.push(
          `网格分块：项 #${ref.fromItemId} 由 ${ref.toItemIds.length} 个子块组成 (#${ref.toItemIds[0]}…#${ref.toItemIds[ref.toItemIds.length - 1]})`,
        )
      }
    }
  }

  return warnings
}
