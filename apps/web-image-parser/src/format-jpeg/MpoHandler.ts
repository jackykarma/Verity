import type { RawSegment } from './JpegSegmentScanner.ts'
import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'

const MPF_SIGNATURE = 'MPF\0'

function payloadHasMpf(data: Uint8Array, seg: RawSegment): boolean {
  const payloadStart = seg.offset + 4
  const head4 = String.fromCharCode(
    data[payloadStart] ?? 0,
    data[payloadStart + 1] ?? 0,
    data[payloadStart + 2] ?? 0,
    data[payloadStart + 3] ?? 0,
  )
  if (head4 === MPF_SIGNATURE || head4.startsWith('MPF')) {
    return true
  }
  const head8 = String.fromCharCode(
    data[payloadStart + 4] ?? 0,
    data[payloadStart + 5] ?? 0,
    data[payloadStart + 6] ?? 0,
    data[payloadStart + 7] ?? 0,
  )
  return head8 === MPF_SIGNATURE || head8.startsWith('MPF')
}

export function detectMpoSegments(segments: RawSegment[], buffer: ArrayBuffer): RawSegment[] {
  const data = new Uint8Array(buffer)
  return segments.filter(
    (seg) =>
      seg.parCatalogId === 'PAR-JPEG-019' ||
      seg.parCatalogId === 'PAR-JPEG-028' ||
      payloadHasMpf(data, seg),
  )
}

export function appendMpoNodes(
  segments: RawSegment[],
  buffer: ArrayBuffer,
  nodes: SegmentNodeDto[],
): void {
  const data = new Uint8Array(buffer)
  let mpoIndex = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg) {
      continue
    }

    const isMpoCatalog =
      seg.parCatalogId === 'PAR-JPEG-019' || seg.parCatalogId === 'PAR-JPEG-028'
    const hasMpf = payloadHasMpf(data, seg)
    if (!isMpoCatalog && !hasMpf) {
      continue
    }

    const mpoId = `mpo-${mpoIndex++}`
    nodes.push({
      id: mpoId,
      parentId: `seg-${i}`,
      label: isMpoCatalog ? 'MPO 多图对象' : 'MPO 多图对象 (MPF)',
      parCatalogId: 'PAR-JPEG-019',
      offset: seg.offset,
      length: seg.length,
      loadType: 'mixed',
      warning: false,
    })

    if (seg.parCatalogId === 'PAR-JPEG-028' || hasMpf) {
      nodes.push({
        id: `mpf-${mpoIndex++}`,
        parentId: mpoId,
        label: 'MPF 多图象素功能段',
        parCatalogId: 'PAR-JPEG-028',
        offset: seg.offset,
        length: seg.length,
        loadType: 'metadata',
        warning: false,
      })
    }
  }
}

export function hasMpoMarker(buffer: ArrayBuffer): boolean {
  const text = new TextDecoder('latin1').decode(buffer.slice(0, Math.min(buffer.byteLength, 65536)))
  return text.includes(MPF_SIGNATURE)
}
