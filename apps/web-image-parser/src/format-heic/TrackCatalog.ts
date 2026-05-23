import type { PayloadKind } from '../shared/types/present.ts'
import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'

const HANDLER_LOAD: Record<string, PayloadKind> = {
  vide: 'video',
  soun: 'audio',
  pict: 'image',
  meta: 'metadata',
}

export function readTrakHandler(data: Uint8Array, trakBox: BmffBox): string | null {
  const end = trakBox.offset + trakBox.size
  let offset = trakBox.offset + 8

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

    if (type === 'mdia') {
      const mdiaEnd = offset + size
      let mo = offset + 8
      while (mo + 8 <= mdiaEnd) {
        const ms =
          (data[mo]! << 24) | (data[mo + 1]! << 16) | (data[mo + 2]! << 8) | data[mo + 3]!
        const mt = String.fromCharCode(data[mo + 4]!, data[mo + 5]!, data[mo + 6]!, data[mo + 7]!)
        if (mt === 'hdlr' && mo + 20 <= mdiaEnd) {
          return String.fromCharCode(
            data[mo + 16]!,
            data[mo + 17]!,
            data[mo + 18]!,
            data[mo + 19]!,
          ).replace(/\0/g, '')
        }
        if (ms < 8) {
          break
        }
        mo += ms
      }
    }

    offset += size
  }

  return null
}

export function enrichTrackNodes(nodes: SegmentNodeDto[], boxes: BmffBox[], buffer: ArrayBuffer): void {
  const data = new Uint8Array(buffer)

  for (const node of nodes) {
    const box = boxes.find((b) => b.offset === node.offset)
    if (!box || box.type !== 'trak') {
      continue
    }

    const handler = readTrakHandler(data, box)
    if (!handler) {
      continue
    }

    const loadType = HANDLER_LOAD[handler] ?? 'metadata'
    node.loadType = loadType

    if (handler === 'vide') {
      node.parCatalogId = 'PAR-HEIC-301'
      node.label = `视频轨 (${node.label})`
    } else if (handler === 'soun') {
      node.parCatalogId = 'PAR-HEIC-305'
      node.label = `音频轨 (${node.label})`
    }
  }
}

export function appendMoovIfPresent(nodes: SegmentNodeDto[], boxes: BmffBox[]): void {
  const moovBoxes = boxes.filter((b) => b.type === 'moov')
  if (moovBoxes.length === 0) {
    return
  }
  for (const moov of moovBoxes) {
    const exists = nodes.some((n) => n.offset === moov.offset)
    if (exists) {
      continue
    }
    nodes.push({
      id: `moov-${moov.offset}`,
      parentId: nodes[0]?.id ?? 'heic-root',
      label: 'moov 电影元数据',
      parCatalogId: 'PAR-HEIC-401',
      offset: moov.offset,
      length: moov.size,
      loadType: 'metadata',
      warning: false,
    })
  }
}
