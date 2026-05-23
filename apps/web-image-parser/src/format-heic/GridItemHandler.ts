import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'
import { readGridRotation } from './HeicExifExtractor.ts'

export function appendTransformHints(
  nodes: SegmentNodeDto[],
  boxes: BmffBox[],
  buffer: ArrayBuffer,
): void {
  const data = new Uint8Array(buffer)
  let hintIndex = 0

  for (const box of boxes) {
    if (box.type !== 'irot' && box.type !== 'imir' && box.type !== 'clap') {
      continue
    }
    const hint = readGridRotation(data, box.offset, box.size)
    const parentId = nodes.find((n) => n.offset === (box.parentOffset ?? -1))?.id ?? nodes[0]?.id
    if (!parentId) {
      continue
    }

    nodes.push({
      id: `xform-${hintIndex++}`,
      parentId,
      label: hint ?? `${box.type} 变换`,
      parCatalogId: 'PAR-HEIC-109',
      offset: box.offset,
      length: box.size,
      loadType: 'metadata',
      warning: false,
    })
  }
}
