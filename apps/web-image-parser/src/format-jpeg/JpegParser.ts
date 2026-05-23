import type { SegmentTreeDto } from '../shared/types/parseMessages.ts'
import type { ParseStatus } from '../shared/types/session.ts'
import { enrichTreeWithExif } from './ExifEnricher.ts'
import { buildSegmentTree } from './SegmentTreeBuilder.ts'
import { collectUnknownWarnings } from './UnknownSegmentHandler.ts'
import { scanMarkers } from './JpegSegmentScanner.ts'

export type { RawSegment } from './JpegSegmentScanner.ts'

export interface JpegParseResult {
  status: ParseStatus
  tree: SegmentTreeDto | null
  message?: string
}

export async function parseJpegBuffer(buffer: ArrayBuffer): Promise<JpegParseResult> {
  const { segments, truncated, warnings } = scanMarkers(buffer)
  if (segments.length === 0) {
    return { status: 'failed', tree: null, message: '非 JPEG 文件或已损坏' }
  }

  const tree = buildSegmentTree(segments, buffer.byteLength)
  await enrichTreeWithExif(segments, buffer, tree.nodes)
  const { appendMpoNodes } = await import('./MpoHandler.ts')
  appendMpoNodes(segments, buffer, tree.nodes)
  tree.warnings.push(...warnings, ...collectUnknownWarnings(segments))

  if (truncated) {
    return { status: 'partial', tree, message: '部分成功：文件可能截断' }
  }

  return { status: 'success', tree }
}

export { scanMarkers } from './JpegSegmentScanner.ts'
export { buildSegmentTree } from './SegmentTreeBuilder.ts'
