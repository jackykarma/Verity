import { isUnknownCatalog } from './segmentCatalog.ts'
import type { RawSegment } from './JpegSegmentScanner.ts'

export function applyUnknownWarning(segment: RawSegment): RawSegment {
  if (isUnknownCatalog(segment.parCatalogId)) {
    return { ...segment, warning: true }
  }
  return segment
}

export function collectUnknownWarnings(segments: RawSegment[]): string[] {
  const warnings: string[] = []
  for (const seg of segments) {
    if (seg.warning && isUnknownCatalog(seg.parCatalogId)) {
      warnings.push(`未识别标记 ${seg.label} @ 0x${seg.offset.toString(16)}`)
    }
  }
  return warnings
}
