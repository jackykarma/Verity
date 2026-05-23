import type { SegmentNodeDto, SegmentTreeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'

export function buildHeicSegmentTree(
  boxes: BmffBox[],
  fileLength: number,
  warnings: string[],
): SegmentTreeDto {
  const rootId = 'heic-root'
  const nodes: SegmentNodeDto[] = [
    {
      id: rootId,
      parentId: null,
      label: 'HEIC 容器',
      parCatalogId: 'PAR-HEIC-ROOT',
      offset: 0,
      length: fileLength,
      loadType: 'other',
      warning: false,
    },
  ]

  const offsetToNodeId = new Map<number, string>()

  boxes.forEach((box, index) => {
    const id = `box-${index}`
    offsetToNodeId.set(box.offset, id)
    let parentId = rootId
    if (box.parentOffset !== null) {
      parentId = offsetToNodeId.get(box.parentOffset) ?? rootId
    }

    nodes.push({
      id,
      parentId,
      label: box.label,
      parCatalogId: box.catalogId,
      offset: box.offset,
      length: box.size,
      loadType: box.loadType,
      warning: box.warning,
    })
  })

  return { rootId, nodes, warnings: [...warnings] }
}

export function collectUnknownBoxWarnings(boxes: BmffBox[]): string[] {
  return boxes
    .filter((b) => b.catalogId === 'PAR-HEIC-099')
    .map((b) => `未识别 box ${b.type} @ 0x${b.offset.toString(16)}`)
}
