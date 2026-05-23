import type { PayloadKind } from '../shared/types/present.ts'
import { classifyPayload } from './PayloadClassifier.ts'
import {
  catalogForMarker,
  isRstMarker,
  PAR_ENTROPY_DATA,
  type SegmentCatalogEntry,
} from './segmentCatalog.ts'
import { applyUnknownWarning } from './UnknownSegmentHandler.ts'

export interface RawSegment {
  marker: number
  label: string
  parCatalogId: string
  offset: number
  length: number
  loadType: PayloadKind
  warning: boolean
  parentId?: string | null
}

export interface ScanResult {
  segments: RawSegment[]
  truncated: boolean
  warnings: string[]
}

function toRawSegment(
  marker: number,
  entry: SegmentCatalogEntry,
  offset: number,
  length: number,
): RawSegment {
  const loadType = classifyPayload(entry.parCatalogId, marker)
  return applyUnknownWarning({
    marker,
    label: entry.label,
    parCatalogId: entry.parCatalogId,
    offset,
    length,
    loadType,
    warning: false,
  })
}

function findEntropyEnd(data: Uint8Array, start: number): number {
  let i = start
  while (i < data.length) {
    if (data[i] !== 0xff) {
      i += 1
      continue
    }
    if (i + 1 >= data.length) {
      return i
    }
    const next = data[i + 1]!
    if (next === 0x00) {
      i += 2
      continue
    }
    if (next === 0xd9 || (!isRstMarker(next) && next !== 0x00)) {
      return i
    }
    i += 2
  }
  return data.length
}

export function scanMarkers(buffer: ArrayBuffer): ScanResult {
  const data = new Uint8Array(buffer)
  const segments: RawSegment[] = []
  const warnings: string[] = []
  let truncated = false

  if (data.length < 2 || data[0] !== 0xff || data[1] !== 0xd8) {
    return { segments, truncated: true, warnings: ['缺少 SOI 魔数'] }
  }

  segments.push(toRawSegment(0xd8, catalogForMarker(0xd8, data, 0, 2), 0, 2))

  let offset = 2
  let lastSosEnd = -1
  let eoiOffset = -1

  while (offset < data.length) {
    if (data[offset] !== 0xff) {
      truncated = true
      warnings.push(`偏移 0x${offset.toString(16)} 处缺少 0xFF 标记前缀`)
      break
    }

    const marker = data[offset + 1]
    if (marker === undefined) {
      truncated = true
      break
    }

    if (marker === 0x00) {
      offset += 1
      continue
    }

    const markerStart = offset
    offset += 2

    const standalone =
      marker === 0xd8 ||
      marker === 0xd9 ||
      isRstMarker(marker) ||
      (marker >= 0xd0 && marker <= 0xd7)

    let segmentLength = 2

    if (!standalone) {
      if (offset + 1 >= data.length) {
        truncated = true
        segmentLength = data.length - markerStart
        offset = data.length
      } else {
        const size = (data[offset]! << 8) | data[offset + 1]!
        if (size < 2) {
          truncated = true
          break
        }
        segmentLength = 2 + size
        if (markerStart + segmentLength > data.length) {
          truncated = true
          segmentLength = data.length - markerStart
          offset = data.length
        } else {
          offset = markerStart + segmentLength
        }
      }
    } else {
      offset = markerStart + 2
    }

    const entry = catalogForMarker(marker, data, markerStart, segmentLength)
    segments.push(toRawSegment(marker, entry, markerStart, segmentLength))

    if (marker === 0xda) {
      const sosEnd = markerStart + segmentLength
      const entropyEnd = findEntropyEnd(data, sosEnd)
      if (entropyEnd > sosEnd) {
        segments.push(toRawSegment(0, PAR_ENTROPY_DATA, sosEnd, entropyEnd - sosEnd))
      }
      offset = entropyEnd
      lastSosEnd = -1
      continue
    }
    if (marker === 0xd9) {
      eoiOffset = markerStart
      break
    }
  }

  if (lastSosEnd >= 0) {
    const entropyEnd = eoiOffset >= 0 ? eoiOffset : findEntropyEnd(data, lastSosEnd)
    if (entropyEnd > lastSosEnd) {
      segments.push(
        toRawSegment(0, PAR_ENTROPY_DATA, lastSosEnd, entropyEnd - lastSosEnd),
      )
    }
  } else if (segments.length > 1 && eoiOffset < 0) {
    truncated = true
    warnings.push('未找到 SOS/EOI，可能不完整')
  }

  if (truncated && eoiOffset < 0) {
    warnings.push('文件截断，未找到 EOI')
  }

  return { segments, truncated, warnings }
}
