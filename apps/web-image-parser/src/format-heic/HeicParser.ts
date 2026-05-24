import type { SegmentTreeDto } from '../shared/types/parseMessages.ts'
import type { ParseStatus } from '../shared/types/session.ts'
import { parseBmffBoxes } from './BmffReader.ts'
import {
  attachItemLocations,
  classifyAuxiliaryItems,
  markPrimaryImageItem,
} from './AuxImageCatalog.ts'
import { buildHeicSegmentTree, collectUnknownBoxWarnings } from './ContainerTreeBuilder.ts'
import { appendTransformHints } from './GridItemHandler.ts'
import { appendGrplNodes } from './GrplHandler.ts'
import { enrichIpmaLabels } from './IpmaEnricher.ts'
import { parseIloc } from './IlocParser.ts'
import { applyLivePhotoLinks } from './LivePhotoLinker.ts'
import { applyItemLabelEnrichment } from './ItemLabelEnricher.ts'
import { appendMoovIfPresent, enrichTrackNodes } from './TrackCatalog.ts'

export interface HeicParseResult {
  status: ParseStatus
  tree: SegmentTreeDto | null
  message?: string
}

export function parseHeicBuffer(buffer: ArrayBuffer): HeicParseResult {
  const { boxes, truncated, warnings } = parseBmffBoxes(buffer)
  if (boxes.length === 0) {
    return { status: 'failed', tree: null, message: '非 HEIC/HEIF 文件或已损坏' }
  }

  const itemLocations = parseIloc(buffer, boxes)
  const tree = buildHeicSegmentTree(boxes, buffer.byteLength, warnings)

  markPrimaryImageItem(tree.nodes, boxes)
  classifyAuxiliaryItems(tree.nodes, boxes)
  applyItemLabelEnrichment(tree, boxes, buffer)
  attachItemLocations(tree.nodes, boxes, itemLocations)
  appendMoovIfPresent(tree.nodes, boxes)
  enrichTrackNodes(tree.nodes, boxes, buffer)
  applyLivePhotoLinks(tree, boxes, buffer)
  enrichIpmaLabels(tree.nodes, boxes, buffer)
  appendGrplNodes(tree.nodes, boxes, buffer)
  appendTransformHints(tree.nodes, boxes, buffer)

  tree.warnings.push(...collectUnknownBoxWarnings(boxes))

  if (truncated) {
    return { status: 'partial', tree, message: '部分成功：容器可能截断' }
  }

  return { status: 'success', tree, message: 'BMFF 解析完成' }
}

export { detectHeicEnvironment } from './HeicEnvDetector.ts'
export type { HeicEnvReport, HeicEnvLevel } from './HeicEnvDetector.ts'
