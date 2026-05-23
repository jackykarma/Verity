import type { SegmentTreeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'
import { appendReferenceNodes } from './ItemRefBuilder.ts'

export function applyLivePhotoLinks(
  tree: SegmentTreeDto,
  boxes: BmffBox[],
  buffer: ArrayBuffer,
): void {
  const warnings = appendReferenceNodes(tree.nodes, boxes, buffer)
  tree.warnings.push(...warnings)
}
