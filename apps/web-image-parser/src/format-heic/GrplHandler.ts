import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'

export interface EntityGroupRef {
  groupId: number
  entityIds: number[]
}

export function parseGrplReferences(data: Uint8Array, grplBox: BmffBox): EntityGroupRef[] {
  const refs: EntityGroupRef[] = []
  const end = grplBox.offset + grplBox.size
  let offset = grplBox.offset + 12

  while (offset + 8 <= end) {
    const size =
      (data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!
    const type = String.fromCharCode(
      data[offset + 4]!,
      data[offset + 5]!,
      data[offset + 6]!,
      data[offset + 7]!,
    )
    if (size < 8) {
      break
    }

    if (type === 'refe' && offset + 16 <= end) {
      const groupId = (data[offset + 12]! << 8) | data[offset + 13]!
      const count = (data[offset + 14]! << 8) | data[offset + 15]!
      const entityIds: number[] = []
      for (let i = 0; i < count; i++) {
        const at = offset + 16 + i * 2
        if (at + 1 >= end) {
          break
        }
        entityIds.push((data[at]! << 8) | data[at + 1]!)
      }
      refs.push({ groupId, entityIds })
    }

    offset += size
  }

  return refs
}

export function appendGrplNodes(
  nodes: SegmentNodeDto[],
  boxes: BmffBox[],
  buffer: ArrayBuffer,
): void {
  const data = new Uint8Array(buffer)
  let idx = 0

  for (const box of boxes) {
    if (box.type !== 'grpl') {
      continue
    }
    const parentId = nodes.find((n) => n.offset === box.offset)?.id
    if (!parentId) {
      continue
    }

    const refs = parseGrplReferences(data, box)
    for (const ref of refs) {
      nodes.push({
        id: `grpl-ref-${idx++}`,
        parentId,
        label: `分组 #${ref.groupId}：项 ${ref.entityIds.map((id) => `#${id}`).join(', ')}`,
        parCatalogId: 'PAR-HEIC-014',
        offset: box.offset,
        length: box.size,
        loadType: 'metadata',
        warning: false,
      })
    }
  }
}
