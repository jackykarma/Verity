import type { PayloadKind } from '../shared/types/present.ts'
import type { SegmentNodeDto, SegmentTreeDto } from '../shared/types/parseMessages.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'
import type { RawSegment } from './JpegSegmentScanner.ts'

export function buildSegmentTree(segments: RawSegment[], fileLength: number): SegmentTreeDto {
  const rootId = 'jpeg-root'
  const nodes: SegmentNodeDto[] = [
    {
      id: rootId,
      parentId: null,
      label: 'JPEG 文件',
      parCatalogId: 'PAR-JPEG-ROOT',
      offset: 0,
      length: fileLength,
      loadType: 'other',
      warning: false,
    },
  ]

  segments.forEach((seg, index) => {
    nodes.push({
      id: `seg-${index}`,
      parentId: seg.parentId ?? rootId,
      label: seg.label,
      parCatalogId: seg.parCatalogId,
      offset: seg.offset,
      length: seg.length,
      loadType: seg.loadType,
      warning: seg.warning,
    })
  })

  return { rootId, nodes, warnings: [] }
}

export function sortSegmentsByOffset(segments: RawSegment[]): RawSegment[] {
  return [...segments].sort((a, b) => a.offset - b.offset)
}

export interface SofSummary {
  width: number
  height: number
  components: number
}

export function parseSofSummary(data: Uint8Array, offset: number, length: number): SofSummary | null {
  if (length < 9) {
    return null
  }
  const base = offset + 4
  const height = (data[base + 1]! << 8) | data[base + 2]!
  const width = (data[base + 3]! << 8) | data[base + 4]!
  const components = data[base + 5] ?? 0
  return { width, height, components }
}

export function comText(data: Uint8Array, offset: number, length: number): string {
  const start = offset + 4
  const end = offset + length
  let text = ''
  for (let i = start; i < end; i++) {
    const c = data[i]
    if (c === undefined) {
      break
    }
    text += String.fromCharCode(c)
  }
  return text.trim()
}

export function segmentReadableHint(
  seg: RawSegment,
  data: Uint8Array,
): { title: string; fields: { key: string; value: string }[] } {
  const fields = [
    { key: '目录 ID', value: seg.parCatalogId },
    { key: '偏移', value: formatByteOffset(seg.offset) },
    { key: '长度', value: String(seg.length) },
  ]

  if (seg.parCatalogId === 'PAR-JPEG-010') {
    fields.push({ key: '注释', value: comText(data, seg.offset, seg.length) })
  }

  if (seg.parCatalogId === 'PAR-JPEG-013') {
    const sof = parseSofSummary(data, seg.offset, seg.length)
    if (sof) {
      fields.push({ key: '宽度', value: String(sof.width) })
      fields.push({ key: '高度', value: String(sof.height) })
      fields.push({ key: '分量数', value: String(sof.components) })
    }
  }

  return { title: seg.label, fields }
}

export type { PayloadKind }
